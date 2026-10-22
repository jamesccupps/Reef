// fish3.js — the fish of the 3-D lakes (pure: no DOM; Node and browser). Stage 5, slice a: the agent core — founders at the
// real lakes' densities, 3-D senses and brains, innate habitat drives, movement, feeding on the water's fields and on each
// other, bioenergetics, hazards and death, lifetime learning. docs/HOT_BROOK_3D.md §4; the 2-D pipeline this ports is
// world.js (its formulas are kept where they carry over, with the 2-D clock's times ÷ TS).
//
// AGENTS. One brain per fish (pumpkinseed, brown bullhead, smallmouth bass, chain pickerel, white sucker) or per SCHOOL
// (yellow perch, white perch, banded killifish): a school agent carries n fish of one genome and one body record (length, mass,
// gut, gonads). The super-individual rules (Scheffer et al. 1995; research_notes/Whole lake 3D fish simulation/
// super_individuals.md): natural, heat, hypoxia and starvation losses take a FRACTION of n (real-valued; a school below one
// fish is gone); a strike on a school takes ONE fish; a school eats n fish's worth from the water around it, so crowding and
// competition come from the fish (Σ n × mass), never from agent counts; schools of one species and size merge (the merged
// school keeps one parent's genome, chosen ∝ n — never averaged weights) and split above twice their size.
//
// UNITS. Positions in world metres (x east, y north, z depth below the local water surface, down). Bodies, swimming speeds,
// senses and densities are REAL (fish per square metre at the real lakes' numbers), so a fish meets its school, its prey and
// its predators at real rates per second of its swimming; the lakes are 1/10 of their real size (trips take 1/10 of their real
// time — the human's choice, 2026-10-16). TIME (clock3.js) is REAL: a step covers dt real seconds of the fish's lives
// (physiology, feeding, hazards, ageing: a day is DAY3 = 86,400 s) and mv seconds of their swimming. STAGE R2 COMPAT: the gate
// and the view still run the 1-hour year's steps (dt 876 s with mv 0.1 s; docs/W3_REALTIME_AUDIT.md), so feeding on the
// water's fields (zooplankton, the bed's worms and scuds) is still a functional response to the local density over the ~15 min
// a step stands for, at rates by the day's light (lightDay), and the day–night cycle still the 1-hour year's (12.2 calendar
// days); R3 gives each rung its own mechanisms. BEHAVIOUR follows the hour: where a fish chooses to be by day and by night.
import { GEO, LAND, UPPER, LOWER, BROOK, BODIES, cellIndex } from './geometry.js';
import { CLOCK3, TS, DAY3, OLD_S } from './clock3.js';
import { A2, naupShare, CHEM3 } from './chem3.js';
import { LIT3 } from './littoral3.js';
import { PL3 } from './plants3.js';
import { SP3 as SP, SPECIES3 as SPECIES } from './species3.js';
import { rand, gauss, clamp, angDiff, randomGenes, mutate, crossover, mutateGenes, crossoverGenes } from '../core.js';
import { prepBio, cmax, consumptionT, consumptionTrel, respStd, routineActivity, wasteFractions, energyDensity, stdWeight, lengthFor, OXYCAL, coldResp, coldCmax, energyOf, massOf } from '../bioenergetics.js';
import { ENV, BIOE, PLANKTON, ZOO3, WEATHER3, HERP3, EGG3, ALEWIFE, PHYTO, NUTRIENT, WORLD, BENTHOS, PREY, FEED, LEARN, BRAIN, ACTION, SPAWN, TIME, ICE, FRY, BROOD, seasonalTemp, WINTER0, winterDays, winterStep, winterWindow, winterDaysJE, winterStepJE } from '../config.js';

const YEAR = CLOCK3.YEAR_LEN, DAY = DAY3, Y2 = TIME.YEAR_LEN;   // (the 2-D sim's ages and times are on its 1800-s year)
const LN2 = Math.LN2;
const expm = x => -Math.expm1(-x);   // 1 − e^(−x): the share a first-order process completes over a step (exact at any dt)

// ============================================================ tunables ===============================================
// TRUE SCALE (docs/TRUE_SCALE.md T3): the LANDSCAPE distances below — home ranges, search radii, the brook's reach, the foraging
// footprint, site spacing, the bed's slope — are written as real metres × GEO.SCALE (or the brook's × GEO.BROOK_SCALE), so the 1/10
// world keeps its values and the true-size one gets the real ones; the BODY-scale ones (senses, spacing, strike, mate and nest
// distances, swimming) are real in either world and unchanged. HOME: the 1/10 world's leash radii read ×10 overshoot most
// species' measured ranges (habitat3d.md), so the true-size world takes them from the research instead
const HOME = (w, real) => GEO.SCALE < 1 ? w : real;
// (a species' traditional spawning grounds per lake scale with the lake's AREA — the colonies hold as many fish as they did at
// 1/10: with the 1/10 world's 10 pumpkinseed grounds a lake, the true-size one's 31,000 ripe sunfish piled ~1,500 to a colony,
// 90 agents to a 4-m cell, and the mate search scanned them all)
const SITES_MUL = (GEO.SCALE / 0.1) ** 2;   // (1 at 1/10, 100 at true scale)
export const F3 = {
  HC: 4,                // m: the neighbour hash's cell (≥ the longest sense range in clear water)
  MATE_HC: 40,          // m: the ripe fish's own index's cell (the mate search reaches 6–40 m, a brook run's 40–80: a few cells, of ripe fish only —
                        //   through the 4-m hash it scanned ~400 cells of every fish per ripe fish: a third of a true-scale block in June)
  DECIDE_EVERY: 2,      // steps between a fish's decisions (senses → brain): 5 Hz at the 10-Hz step, staggered by id
  ALLY_R: 2.5,          // m: a fish counts its own kind within this
  DRAG: 1.4,            // /s: speed relaxes toward thrust × top speed at this rate
  PITCH_MAX: 0.6,       // rad: the steepest a fish climbs or dives
  PITCH_K: 1.5,         // rad of pitch per metre the fish is off its target depth (clamped)
  PITCH_RATE: 3,        // /s: pitch eases toward its target
  BRAIN_TURN: 0.6,      // the brain's turn command as a share of the turning rate (the innate drives steer the rest) …
  TURN_HP: 3,           // s: … less its running mean (a constant bias would circle)
  BRAIN_PITCH: 0.3,     // … and its pitch command as a share of PITCH_MAX
  HAB_W: 0.8,           // weight of steering back into the species' bottom-depth band (per metre outside it, ≤ 1)
  FORAGE_W: 0.9, PURSUIT_W: 1.6, FLEE_W: 2.2, COHERE_W: 0.6, HOME_W: 0.5, AVOID_W: 4,
  ESC_O2: 3, ESC_PITCH: 1.1,   // below ESC_O2 × its lethal O2 (or half its critical) a fish escapes upward at up to ESC_PITCH rad
  O2_W: 2.5,                   // below its critical O2 a fish also swims across the lake toward better water (O2_SEEK)
  LOOK: 1.2,            // s of swimming it looks ahead for shallows and shore (at least 0.8 m)
  // THE FIDELITY LADDER (stage R3; docs/HOT_BROOK_3D.md §4 "Design (stage R3)"): a step of dt ≤ FINE_MAX s swims (senses and
  // brains at 5 Hz, the kinematics); a longer one is a COARSE BLOCK — one decision by the fish's own brain, then it goes where
  // its drives point and its brain bends them (_relocate): at most RELOC_N hops of at least RELOC_MIN m (the bed grid's cell),
  // re-aimed after each; drives weaker than RELOC_STILL leave it where it is; the rest of the block it wanders about the place
  // (its search path's persistence WANDER_TAU s: a net v·√(τ·t)); BAND_SLOPE the bed's typical slope at the 1/10 scale, to
  // judge how far its depth band lies
  // RISES (for the view: the human's "the bugs on the surface and bass or some fish jumping to get them"): a fish's surface
  // feeding counted as single insects of INSECT_G g wet (by count mostly midges, ~1–2 mg, and small land insects; mayflies tens of mg), each a
  // rise — at most RISE_MAX an agent a step
  INSECT_G: 0.002, RISE_MAX: 4,
  FINE_MAX: 1, RELOC_N: 6, RELOC_MIN: GEO.CELL, RELOC_STILL: 0.12, BRAIN_BEND: 0.6, WANDER_TAU: 5, BAND_SLOPE: 0.012 / GEO.SCALE, FLEE_D: 2,   // (RELOC_MIN the bed grid's cell: 1.5 at 1/10, 5 true; BAND_SLOPE the bed's typical slope: 0.12 at 1/10, 0.012 real)
  ZTOP: 0.08, ZBOT: 0.04,   // m of clearance under the surface and over the bed
  ICE_M: 0.35,          // m: the ice's thickness at full cover (fish stay under it)
  FEAR_DECAY: 0.5,      // /s (the 2-D sim's DRIVE.FEAR_DECAY — a moment-to-moment behaviour, not a calendar rate)
  // LIFETIME LEARNING: the plastic weights relax toward the genome at LEARN_DECAY a second (compat: the 2-D LEARN.DECAY per sim
  // second of the 1-hour year — ~4.9 h of calendar; R3: hours to days, rewards from events)
  LEARN_DECAY: LEARN.DECAY / OLD_S,
  // PISCIVORY: a predator's kill hazard is ATTACK × Σ over the catchable fish within its strike reach of (1 − d/R) × capture ×
  // the prey's vulnerability × size selection × concealment, a school counting n^SCHOOL_EXP (dilution and confusion: the
  // per-capita risk falls with school size — Turner & Pitcher 1986)
  ATTACK: 2.0 / OLD_S, SCHOOL_EXP: 0.5,   // (compat: 2 per sim second of the 1-hour year — its 2.4 h of hunting; R3: events)
  // (a predator that isn't confused by a school takes its own S3 schoolExp: esocids attack from inside a school at ~70 % success
  // — Jolles et al. 2022 — and catch as well in schools as singly, Turesson & Brönmark 2004; perch and bass are confused)
  // THE SIZE RULE (stage P2): a strike's success × (1 − x^SIZE_K), x = the prey's body depth / the predator's gape — near flat over
  // the small prey and falling to nil at the gape. Field capture success falls about linearly with relative size (soft-rayed prey
  // 1 − r, spiny 0.70 − 1.34·r; Miller 1988, Scharf 2003) while encounter rises with prey length (reaction distance), and adult
  // pickerel's prey average ~0.3 of their length (research `Whole lake 3D fish simulation/predator_diets_and_prey_mortality.md`
  // §7.2). The 2-D sim's (1 − x)^FEED.SIZE_SEL (2) made a 10–13-cm perch 4–8× less catchable than a 6-cm killifish to a 35-cm
  // pickerel — the field's rules ~2× — and the lakes' perch, the pickerel's first-named prey in Maine, lost < 1 % a year to them
  SIZE_K: 2,
  // THE ENCOUNTER–STRIKE–CAPTURE RULE (stage R item 5; research_notes/Real lake ecology for calibration/piscivore_encounter_attack.md),
  // in place of ATTACK × Σ when STRIKE2: the 1-hour year's ATTACK gave a 40-cm pickerel among perch ~0.017 kills an hour against
  // the 0.4–1.7 a hungry esocid makes (lab strike rates 1.4–5.8 /h × capture success), and a snapshot of the 1-m strike sphere —
  // empty ~90 % of blocks — fed into it. Now: ENCOUNTERS from the prey density about it (the block's prey drifting past from ENC_R
  // m around, per m³ of its water column): E = π·RD²·(ENC_U + its own hunting speed)·N (RD the strike reach × its sight); STRIKES
  // S = aMax·E/(E + ENC_EH) (PRED3: pickerel 3 /h, smallmouth 12, perch-like 4); each strike lands with the prey's CAPTURE success
  // by the predator's kind (CS3, Wahl & Stein 1988; Mauck & Coble; Scharf et al. 1998) × (1 − prey/predator length ÷ PPR0) —
  // esocids take a school's fish as singly (Turesson & Brönmark 2004), bass are confused (× n^−0.8), perch-like × 0.15 into a
  // school; P(kill in dt) = 1 − e^(−S·CS̄·perf·dt), the fish struck ∝ encounters × success, the gut's room gating it. Field
  // targets: 0.5–2 fish a day, 35–60 % empty stomachs; Maine pickerel ~95 % fish (55 % white perch), smallmouth ~80 % (Cooper 1941)
  STRIKE2: 0,           // (1 on — stageR5(); OFF until the young enter the same encounter rule and the GPU has it: see HOT_BROOK_3D.md §4 "Item 5")
  ENC_R: 6,             // m: the neighbourhood read for prey density
  ENC_U: 0.1,           // m/s: the prey's own movement through a predator's reach
  ENC_EH: 30 / 3600,    // /s: the encounter rate at which strikes run at half their maximum
  // THE WATER IT HOLDS (stage R item 6): a prey fish within ENC_R counts by how near the depth of the water under it is to the
  // predator's own — weight 1 − |Δbed| / ENC_DZ. ENC_R's disc smears the prey over 6 m, but on a shore's slope fish keep to their
  // own depth of water: a killifish shoal over 0.4 m and a pickerel lying over 1 m are 3–10 m apart and hold those depths all the
  // block (June, CPU: 65 % of the pickerel's killifish were taken over 0.3–0.6 m by pickerel lying over 0.6–2 m). On the basin's
  // flats the beds within 6 m differ little and the weight stays ~1. 0: off (stageR5 sets it)
  ENC_DZ: 0,
  // THE YEAR'S YOUNG STAY YOUNG (stage R item 6): with RECRUIT_SPRING a school recruits only as an overwintered school in spring,
  // never at L0 in its first summer. Two rules took the same 6-cm fish: as a young school the density rule calibrated to the field's
  // young (stage Y1: ~1 % a day eaten), as a recruit the agents' encounter rule (~15 % a day) — on the GPU in arm E 386,000 young
  // bass and 350,000 young perch recruited in July–August and nearly all were eaten within days, up to ~40 % of the adult bass's
  // food, where field stomachs hold ~no young bass (Maine 0 of 36, Wisconsin 0 of 303; juvenile_refuges_and_bass_young.md §2).
  // Recruitment to the followed fish at age 1, as fisheries count it. 0: off (stageR5 sets it)
  RECRUIT_SPRING: 0,
  HUNGER_GATE: 0,
  YBED_T: 10,
  YCOLD: 0,
  // (the review's phase 1, docs/review/PLAN.md item 6) the followed fish's strikes at the predator's own appetite in cold water too —
  // min(its cold performance, FB4's consumption curve), as YCOLD does for the young: a bass near-still below ~8–10 °C (Oliver 1977;
  // MDIFW) took suckers at 4–7 °C in April at 0.2–0.36 of its summer pace, and 62–126 % of each spring's recruits were lost in the
  // eight weeks around recruiting (arm O)
  SCOLD: 0,
  // (item 7) the spring's recruiting when the water warms back past WINTER0.T (config winterWindow[1], ~12 May), not FRY.SPRING_YF
  // (30 March, three weeks before ice-out): a school recruiting under the ice met the followed fish's strike rule in 1–7-°C water
  RECRUIT_WARM: 0,
  // (the review's phase 2, docs/review/PLAN.md items 8–12) BAND_LAKE m: a band's top is kept this far above its own lake's deepest
  // water (Lower's 3.9 m against Upper's 5.5) — Lower's perches otherwise crowd onto the 0.9 % of it that is ≥ 3.9 m all winter;
  // BASS_SCH: a smallmouth's capture success per fish of a school (n^BASS_SCH; was −0.8 — ×0.03 for an 80-fish school — PDM §7.2);
  // PREY_PREF/PREY_OPT: the strike's CHOICE among the fish it meets weighted by a log-normal preference for prey PREY_OPT of its
  // own length (σ PREY_PREF in ln units; 0 off) — optimal prey 25–43 % of a predator's length (Wahl & Stein 1988), field prey
  // ~0.3 of it, where the capture term alone favours the smallest (a 42-cm pickerel cropped 6-cm killifish); the strike rate is
  // the capture success's, unchanged
  BAND_LAKE: 0, BASS_SCH: -0.8, PREY_PREF: 0, PREY_OPT: 0.3, COVER_CS: 0,
  EGG_SCHOOL: 0,   // (1: a school's ripeness for its eggs is its gonads against ITS ripe GSI — the sexes' mean — not the female's: stageR5)
  // REALISM_PLAN R1 (audit_predation.md §5; the stacked brakes of arms D–T undone to the research design, the hunger gate the brake):
  // COVER_ONCE — cover acts once, on attack initiation (Savino & Stein: vegetation cuts encounters and attacks, not success per
  // attack): every prey counts toward the encounter rate E, (1 − cover) multiplies its attack weight — under E/(E+E_h) cover was
  // lost when E ≫ E_h and squared (with COVER_CS) when E ≪ E_h; SIZE_RENORM — CS3's values were measured at prey 25–43 % of the
  // predator's length (Wahl & Stein 1988), so the size term is 1 at that ratio (S3 pprM by the prey's fins and the predator's kind),
  // not at 0 (it cut capture × 0.6 at the typical 0.32), capped at CS_MAX; EH_AMAX — strikes saturate at E_h = aMax (Holling's
  // S = E/(1 + h·E), h = 1/aMax): ENC_EH 30 /h had no source and made a starving pickerel ignore ~90 % of the prey it met
  COVER_ONCE: 0, SIZE_RENORM: 0, CS_MAX: 0.9, EH_AMAX: 0,
  // REST_DIGEST — THE MEAL AND THE REST: a piscivore sated by its meal (its gut at or over the hunger gate's G) rests while it digests,
  // hunting no fish — strikes or the young — until its gut is down to REST_TO × G, then hunts again with an emptying stomach. Pike in
  // summer eat a meal of ~3–4 %BW every 2.7 days and are 40–58 % empty (Diana 1979; Kakisa Lake 35–40 %), wild bass 25–50 % empty
  // (Dunlop 2005; piscivore_field_feeding_rates.md §2): the gate alone, 1 − gut/G, let a pickerel hunt again a few hours after a
  // 10-g kill (1.2 G) — strike check: 16–20 % empty at p 0.53–0.55. REST_TO 0.1: it hunts again when ~90 % of a satiating meal is
  // evacuated (ET90, the standard measure of a meal's digestion — piscivore_field_feeding_rates.md 'Digestion'); 0.2 gave 28 % empty
  REST_DIGEST: 0, REST_TO: 0.1,
  // REST_ALL: the rest is from all foraging, not only fish — a sated bass grazed crayfish, the weeds' insects and the bed's worms between
  // its meals and ran at p 0.55–0.65 all year, growing to a mean 66 cm at 8+ (arm W, 613; Maine smallmouth Linf ~50)
  REST_ALL: 0,
  // REALISM_PLAN R2a — THE YOUNG'S FOOD BY WHAT IT PAYS (YSHARE): a school splits its foraging among the zooplankton, the weeds' small
  // fauna and the bed's worms and scuds toward the better (t ∝ f^SHARE_Q, f each food's own response), as the adults do (_feed) —
  // not the zooplankton first whatever else is about: young perch move to the bed when the zooplankton runs low (> 5 cm, Wu & Culver
  // 1992), white perch at ~4 cm; with the zooplankton first the year's young cropped it from 400–600 µg/L in late May to 1–6 from
  // September to May (arm T; audit_foodweb_environment.md §2). RWMIN_STEEP: FRY.R_WMIN, written for the bass's steep set, holds a larva's
  // respiration at 0.1 g's only for sets with RB < −0.3 (the Rice set of young bass and bullheads) — on the bluegill and perch sets it
  // cut it to a third or less of Breck's fitted larval rate (audit_habitat_young.md F6)
  YSHARE: 0, RWMIN_STEEP: 0,
  // R2b — SMALL_S: a small followed fish takes the weeds' small fauna (chydorids, early midges, small worms) with the large, fully to
  // LIT3.SM_L[0] cm and none from SM_L[1] — before, only the young's schools could: killifish, small sunfish and dace (the year-old
  // recruits too) foraged the weeds for the large insects only, and the killifish's ration fell to 0.43–0.47 in their strip
  SMALL_S: 0,
  // R1b — MOTHER_FLAT: an adult's unsimulated mortality (M × its S3 mOther share) without Lorenzen's size slope (L/Lref)^−0.87 —
  // that slope is mostly predation's (Lorenzen; audit_physiology.md B), which the encounter rule now simulates
  MOTHER_FLAT: 0,
  // R4·6 — YENC: ONE ENCOUNTER PHYSICS FOR THE YOUNG AND THE FOLLOWED FISH. A followed piscivore met the young-of-year schools of its
  // column through the percid cannibals' DAILY clearance (FRY.CLEAR_A·L^CLEAR_B: ~15 m³/day for a 45-cm pickerel) and the followed
  // fish through its in-bout encounter volume (π·RD²·(ENC_U + v) × act: ~27,000 m³/day) — the same 8-cm fish ~1,700× more
  // encounterable as a yearling agent than as a young-of-year (audit_predation.md 2e). So pickerel took ~1,600 young bass and ~3,400
  // young perch a year against tens of thousands of followed fish (arm X), the spring's recruits and every small adult (killifish,
  // pumpkinseed) bore the predation the field's piscivores put on the year's young (Maine pickerel ~55 % white perch, mostly small),
  // and bass of ages 1–6 vanished in every arm. With it, the young are met through the same volume — the satiation (the hunger gate,
  // the meal's rest) and the young's Holling handling, not a smaller search, keep the intake to the predator's appetite
  YENC: 0,
  // R4·6 — YWIN_CS: ONE SIZE RULE FOR THE YOUNG AND THE FOLLOWED FISH. A piscivore's young-of-year prey were weighted by a perch
  // cannibal's attack-rate window, w(r) = [(R/WIN_R)·e^(1 − R/WIN_R)]^WIN_E (peak r 0.19; 0.19 at r 0.1, 0.0015 at 0.06), × the 2-D
  // sim's vulnerability, while a followed fish of the same species and length met the strike rule's capture success (CS3 × the size
  // term, highest for the smallest prey): a 40-cm pickerel's 4-cm young perch 0.12 against 0.58 as an agent, a 2.5-cm young sunfish
  // 0.001 against 0.21. The field's piscivores eat small prey: the median prey of pike, both basses, walleye, muskellunge, crappie and
  // rock bass is 10–20 % of the predator's length, and the smallest prey rise only 7–14 mm across their whole size range (Gaeta et
  // al. 2018; northern_pike.md Q1). With it a followed piscivore on its encounter volume (YENC) meets the young as it meets the
  // followed fish: the same capture success by species, kind and size ratio (csOf), × their detectability as larvae (FRY.DETECT_L),
  // and its strikes at them count against its strike ceiling (each attack 1/aMax of its hunting time — Holling's h, as _strike2's
  // E_h = aMax): without it a pickerel could clear hundreds of larvae an hour, its gut the only limit. WIN_MIN stays the floor (a
  // 40-cm predator's smallest prey 1.6 cm); the young piscivores' schools keep the percid clearance with its window (Persson's pair)
  YWIN_CS: 0,
  // RD_SIZE — A PISCIVORE'S REACTION DISTANCE BY ITS PREY'S SIZE (both routes): strikeR is its reaction distance to prey of RD_LREF
  // cm in this water (pickerel 1.0–1.2 m, smallmouth 0.8–1.0 m: piscivore_encounter_attack.md §1, the pike model's and Michels's prey
  // of a few cm [inf]); to other sizes by the visual model R²·e^(cR) ∝ the prey's area (Aksnes & Utne 1997; realtime_foraging.md
  // §5.3), c the beam attenuation of the lakes' stained water (RD_C: Kd ≈ 0.85 /m, c between K and 3K in humic water). A 2-cm young
  // fish is seen at ~0.55 of a 6-cm one's distance, a 15-cm perch at ~1.4 — larval roach "severely" less seen by young pike in
  // degraded water (Jönsson et al. 2012) — where the strike rule met every size at the same distance and the young's window stood in
  RD_SIZE: 0, RD_C: 1.7, RD_LREF: 6,
  // WIN_JE: the first winter of a species with WINTER0.JE (white perch) on its own measured model — Johnson & Evans 1990, starved YOY at
  // 4 °C, counted in days below 4 °C (the young's fast) — in place of the Shuter ramp scaled to it (config WINTER0.JE)
  WIN_JE: 0,
  // R4·6 — YSCHOOL: THE YOUNG'S SCHOOLS PROTECT THEM AS THE FOLLOWED FISH'S DO. On the one encounter volume (YENC) the young were met
  // as evenly spread fish, while a followed school of n is met as n^schoolExp fish by an esocid (one fish an attack, success unreduced:
  // Turesson & Brönmark 2004), confuses a bass (capture × n^BASS_SCH) and cuts a perch-like predator's capture to 0.15 — so arm AA
  // (seed 611) ate young perch at Z 0.05–0.16/d by July (25 M → 2 k by August) where Oneida's young perch die at ~0.035/d all told and
  // the old rule gave ~0.03. With it the young of a species are met in its schools (S3 school; a group species' S3 group[1]; solitary:
  // 1) by the followed fish's school terms
  YSCHOOL: 0,
  // E4 — WILD: THE LAKES' FISH-EATING WILDLIFE (WILD3; docs/review/ECOSYSTEM_BUILD.md): loons, herons, kingfishers, ospreys, the eagles,
  // mergansers, otters and mink take their field needs from the fish they can reach — by size, depth, cover, ice, light and preference —
  // the followed fish and the young alike. Before it, nothing but the census cap and M_OTHER stood for them
  WILD: 0,
  // the wildlife's REACH as a forager knows it: its per-fish hazard ρ = D / (A + K) from the larger of the fish it can reach at the block's
  // start and their running mean over WILD_TAU days — a block that began with few fish at the surface had set a rate the fish rising
  // into reach within it were all taken at (ospreys and eagles took 128 % of their need over a July fortnight: the gate of af3723e)
  WILD_TAU: 1,
  // R2·3 — YDEPTH: THE YOUNG'S DEPTH IN THE PREDATORS' REACH. The young's prey table held a column's schools by species and length
  // only, so a 40-cm bass reached young in 0.3 m of water as in 3 m, where a followed fish of the same size is out of its reach over
  // a bed shallower than half the water the predator needs (SHALLOW_K: none at ≤ 0.5·K·L, full at ≥ K·L). With it the table's bins
  // are also by the bed's depth (classes at YD_E0–2 m) and each predator's request reaches a bin by that rule on the bin's mean bed —
  // one shallows' rule for young and followed fish. (Arm Z, seed 613, with the young met through the encounter volume: adult bass
  // ate 1.36 M young bass in the first summer, the cohort 3.1 M → 16 k by mid-August, against field stomachs with almost none —
  // Maine 0 of 36, Wisconsin 0 of 303 — while young smallmouth live in the shallows near their nests: juvenile_refuges_and_bass_young.md)
  YDEPTH: 0, YD_E0: 0.3, YD_E1: 0.6, YD_E2: 1.2,
  // (the review's phase 4, items 17 and 19) YO2_MARGIN mg/L: in cold water (< YO2_T °C) the young choose their water — the bed, the
  // zooplankton's cells, the escape — with O₂ ≥ their critical level + YO2_MARGIN (0: only ≥ critical, and the zooplankton's choice
  // untested; a multiple of the critical level was wrong: 2× a white perch's 4.3 mg/L is summer's saturation): in arm O the young of
  // every species died of hypoxia under the ice at 8–25 % a fortnight, sitting all winter on the richest bed — the organic beds
  // that go anoxic first — and testing O₂ only once it was below critical; Hot Brook is no winterkill lake (white perch winter in
  // it) and the adults in the same water did not die. YM_COLD: the young's unsimulated mortality (BIOE.M_OTHER's share of M)
  // slows in cold water as their predation does (FRY.M_JUV_Q10), its size multiplier capped at YM_CAP (the agents' 3; it was 30):
  // alone it took 20–35 % of the young over a winter when no heron, kingfisher or merganser is about
  YO2_MARGIN: 0, YO2_T: 10, YM_COLD: 0, YM_CAP: 30,
  // (phase 4, docs/review/PLAN.md item 2's finding) YW_T0/YW_T1 °C: a young school past its first YW_AGE days feeds in proportion to
  // (T − YW_T0)/(YW_T1 − YW_T0) — none below YW_T0 (0: off): followed by id from September to March, the same schools of yellow perch,
  // white perch, sucker and fallfish grew 1.9–2.2 cm, most of it at 1–2 °C under the ice (probe/wgrow.mjs), where young perch stop
  // growing below ~10 °C and live on their autumn reserves — so the first winter's size-selective loss never bit
  YW_T0: 0, YW_T1: 10, YW_AGE: 90,         // (1: a predator hunts the young at min(its cold performance, its FB4 consumptionT) — stageR5 sets it)       // °C: a young school keeps to its species' shelf (S3 yBed) only in water at least this warm   // (1: the hunger gate in _feed — S3 G0, %BW as a fraction; stageR5 sets it)
  // A NARROW BAND HELD (stage R item 6c): the pull back into the bottom-depth band grows per metre outside it (HAB_W × clamp(off,
  // 0.2, 1)); with BAND_REL per band-width for bands under 1 m — a killifish 0.2 m too deep for its 0.3-m band pulled at 0.16 of
  // HAB_W, beaten by any food's pull, and sat just outside it, over 0.35–0.6 m where the pickerel are (arm E: 41 % of the killifish
  // eaten over 0.3–0.6 m, 29 % over 0.6–1). 0: off (stageR5 sets it)
  BAND_REL: 0,
  SHALLOW_REFUGE: 0.6,  // very shallow water hides small fish from gape-limited predators: cover = this × clamp((0.8 − bed)/0.6) (the young's)
  // THE SHALLOWS ARE THE SMALL FISH'S (stage P3): a predator strikes at full effect only over water ≥ SHALLOW_K × its length (m/cm),
  // not at all over half that — a 35-cm pickerel from 0.7 m (none under 0.35), a 20-cm bass 0.4, a 12-cm perch 0.24: big fish don't
  // work the shallows — fish > 3–4 cm avoided water < 20 cm, large bass held pools > 50 cm on 72 of 75 pool-dates (Power 1987), the
  // small fish of a stream kept to its shallows where bass were (Schlosser 1987), pickerel half their time at 0.76–1.82 m
  // (Milipsigate Lake telemetry) — while small predators still hunt there (Schlosser: bass took prey in the refuges). It replaces
  // the followed fish's SHALLOW_REFUGE cover (the same for a killifish as for a bass): with it the pickerel took the killifish in
  // their own 0.1–0.6-m water (57 % of July's kills; cover there 0.1–0.4) and fell from 0.30 to 0.13× in a year (docs/FINDINGS.md)
  SHALLOW_K: 0.02,
  // A BURROWER'S WINTER (S3 bury): in cold water — fully at ≤ 5 °C, none from 9 °C, the habitat's winter blend — a fish within
  // BURY_H m of the bed is dug into it: cover = bury (× the blend)
  BURY_H: 0.3,
  // THE RIFFLES' REFUGE: in the brook's riffles and runs (bed < RIFFLE_D m) a fish under RIFFLE_L cm hides between the stones in
  // the current, where ambush predators don't hold — dace and young fallfish live with pickerel, bass and fallfish in streams
  // (habitat3d_new_species.md: dace under overhead cover at 15–45 cm/s; predators keep to the pools). Without it the brook's
  // dace were eaten out in a summer once the lakes' predators could range into the brook.
  // BIGGER-DEEPER (stage P2): in the brook a fish of RIFFLE_L cm or more holds the pools — water ≥ RIFFLE_D m — unless it is
  // spawning or on its nest: large bass occupied pools > 50 cm deep on 72 of 75 pool-dates, fish > 3–4 cm avoided water < 20 cm
  // (Power 1987), and with bass present juveniles kept to the shallow riffles (Schlosser 1987); pickerel ambush from the pools'
  // banks and wood (research brook_food_web.md §4). The refuge alone was not enough: the lakes' pickerel and bass, holding their
  // own depth bands (≥ 0.5 m), sat in the brook's 0.5–0.6-m runs and took ~1,000 of its ~1,400 dace in a summer
  RIFFLE_REFUGE: 0.9, RIFFLE_D: 0.6, RIFFLE_L: 10,
  BENTH_REACH: 0.35,    // m above the bed a fish feeds on it
  // A COARSE BLOCK's place is the fish's mean height over the block, and it drifts up and down about it: its bed and weed feeding
  // is the share of the block within reach — the heights gamma-distributed (shape 2) about the mean h: 1 − e^(−x)(1 + x), x =
  // 2·reach/h. At their block heights only ~10 % of the bass and ~30 % of the pickerel were within reach, against 42–51 % and ~55 % over
  // fine steps (1/10, July: the long runs fed the crayfish eaters ~⅓ less than the fine steps near the camera); the share gives ~50 %
  // and ~59 %, sunfish 13 % (fine 11 %), redbreast 18 % (22 %), white perch 3 % (0 %), the bottom-huggers ~99 % (91–100 %) — an
  // exponential spread gave the fish that keep off the bottom 2–4× too much. (0: in reach or not, by the block's place — before
  // 2026-10-18; a fine step is where the fish is either way)
  BED_SHARE: 1,
  // THE BED OR THE OPEN WATER (stage 6): an adult shares its foraging time between its two foods toward the better (t ∝ f^SHARE_Q),
  // instead of eating both at once; K_BENTH (g/m² above the refuge) the half-saturation of an adult's bed foraging
  SHARE: 1, SHARE_Q: 4, K_BENTH: 3,
  // K_ZOO (µg dry/L): an adult planktivore's half-saturation on zooplankton (type III) — adult fish saturate at ~10–20 Daphnia
  // per litre (~50–100 µg/L). With a bed to turn to, the zooplankton settles where it pays as well as the bed (~90 µg/L at a
  // 7 g/m² bed — the real 45–100); the 2-D sim's PLANKTON.K_ADULT (25) was low because its adults had nothing else to eat
  K_ZOO: 60,
  // THE FORAGING FOOTPRINT: one sim second stands for ~2.4 real hours of foraging, over which a real fish works hundreds of
  // metres of its range — ground no fish can swim at real speed in a second. So an adult feeds from the water and the bed
  // about it within FP_HOME × its home range (FP_MIN–FP_MAX m), on the bed within FP_DZ of its own depth: it still chooses where
  // to be, and food is still depleted where fish crowd, on the scale of a fish's day rather than of its second. Adults feed at
  // their decision rate (DECIDE_EVERY steps × dt)
  FP_HOME: 0.25, FP_MIN: 40 * GEO.SCALE, FP_MAX: 200 * GEO.SCALE, FP_DZ: 0.75,   // (40–200 m real: 4–20 at 1/10)
  // REPRODUCTION (slice b)
  SPAWN_LEAD: 2,        // °C: a ripe fish heads for its spawning ground this far below its spawning temperature
  // SPAWNING ON STRUCTURE (S3 spawn.sub; plants3 PL3.SPAWN): a ripe plant spawner without traditional grounds looks over
  // SUB_TRIES places within SUB_R m (world: ~400 m real across the 1/10 lakes — perch gather from their wintering water to the
  // spawning shallows) and heads for the best structure, a detour of SUB_R costing SUB_DETOUR of an index; the species with
  // grounds (chain pickerel) re-choose them each spring at SITE_YF (~mid-April, before ice-out) by the structure then — last
  // year's standing stems and the evergreen mats
  SUB_TRIES: 80, SUB_R: 400 * GEO.SCALE, SUB_DETOUR: 0.25, SITE_YF: 0.1, SITE_SEP: 60 * GEO.SCALE,   // (SITE_SEP: a species' traditional grounds this far apart)   // (tries: most land outside the spawning depths — once a season a fish, cheap)
  SPAWN_RATE: 0.25 / OLD_S,   // /s: on its ground, with a mate, at full spawning temperature, a fish spawns at this rate
                              //   (compat: ~10 h; R3: by the hour and the time of day)
  MATE_R: 1.5,          // m: a mate this close (an individual species' pair)
  MATE_CUE: 1.5,        // a ripe fish heads for the nearest ripe fish of the other sex within this × its species' spacing (6–40 m)
  SEED_RUNS: 3,          // (the season's start: the brook's nest sites filled this many times over a run — fish come and go over its ~3 weeks; an estimate)
  RUN_MOUTH: Math.max(30 * GEO.SCALE, 3 * GEO.CELL),   // m: a runner this near the brook's mouth finds whether its nest sites are taken
  BROOK_NEAR: 600 * GEO.SCALE, BROOK_RUN: 1500 * GEO.SCALE,   // m from their lake's end of the brook: the pumpkinseed that summer in it, the suckers that run up it (60 / 150 at 1/10)
  // THE LAKES ARE ONE WATER (the human, 2026-10-16: "pickerel swim through the brook", "bass too", "everything does"; research
  // docs/research_notes/Whole lake 3D fish simulation/movement_between_lakes.md). A fish ranges into the brook like any of its
  // water; each year a share of each species (S3 move.settle — sunfish and bullhead ~5–10 %, perch and white perch 15 %, bass and
  // pickerel 5 %: connected-lake telemetry and trapping, Riley Creek's pike, Minnesota's bluegill chain, Okoboji's perch) settles
  // in the other lake, going through the brook — the fish living near a mouth far more often than those across the lake
  // (e^(−d/ROAM_L) over its lake's mean: Mattamuskeet's west-lake bass never reached the east side); and some make TRIPS through
  // it and back (move.trip a year in their season — the pickerel's spring run at ice-out, ~90 % back within weeks)
  ROAM_L: 1000,         // m real: the distance from the brook's mouth over which the chance of crossing falls by e
  MIGRATE_V: 1.2,       // m/s: a long goal trip (> 20 m: a spawning run, last year's nest, the brook) at up to this (≤ half its sprint)
  GOAL_W: 1.5,          // steer weight toward a goal (a spawning riffle, last year's nest, the brook's pools, back home)
  RIPE_HUNT: 0.5,       // a ripe fish's hunting and foraging pulls × this (spawners feed at reduced intensity, ~half: fallfish_spawning_brook.md §3 [inf])
  GUARD_R: 1.0,         // m: a guardian keeps within this of its nest; its fry are held within it
  CAP: 1.5,             // a species' fish ≥ its recruits at most this × its census (a safety: abundance is the sim's)
  // YOUNG-OF-YEAR (the 2-D sim's FRY, its times ÷ TS)
  YOY_TICK: 0.4 * OLD_S,   // s between a school's feeding / physiology / mortality updates (staggered; compat: 58 min)
  YOY_BL: 4, YOY_VMAX: 0.25,   // a young school moves at YOY_BL lengths a second (≤ YOY_VMAX m/s): it lives on the physiological clock
  // ...and between its decisions it CRUISES about its feeding spot (the human, 2026-10-16: "do they all just swim in circles all
  // the time?" — the young schools parked on their spot for the hour between decisions, and the view drew their fish milling in
  // place): real fry schools keep moving, working the shallows as they feed — at YOY_CRUISE lengths a second on a heading that
  // wanders YOY_TURN rad/√s, turned back as it nears YOY_ROAM m from its spot or water much deeper or shallower than the spot's
  YOY_CRUISE: 1.5, YOY_TURN: 0.3, YOY_ROAM: 150 * GEO.SCALE, YOY_DBED: 0.8,   // (YOY_ROAM ~150 m real: age-0 bass stay within ~200 m of their nest)
  FAR: 200 * GEO.SCALE,  // m: a goal trip longer than this goes at MIGRATE_V; the brain's shore cue saturates over it
  YOY_EAT_R: 0.6,       // m: a fish picks at a school of young within this (+ its own length)
  YOY_MERGE_R: 1.5,     // m: schools of young of a species and size meet and merge within this
  // THE SEASON'S YOUNG SO FAR (seedSeason: a new lake or a season jump): the young are carried from their spawning day to the
  // date at SEED_P of their Cmax with their own mortality × SEED_M (for the eaters' takes the live sim adds, _eatYoy). SEED_P is
  // the spring's [0] until SEED_P_YF[0], easing to the summer's [1] by SEED_P_YF[1]: the live young feed at 0.7–1.0 of Cmax
  // through June and fall to 0.25–0.45 in late July (the midsummer zooplankton collapse, scramble competition). Calibrated
  // against the same lakes run in full from ice-out (3 seeds to May 20: perch 1.05, suckers 1.4, pickerel 1.05 cm, white perch
  // just hatched, and their survival; 2 seeds to Sept 12: perch 5.0–5.5, suckers 4.9–5.6, white perch 3.9–4.6, bullheads
  // 4.2–4.8, pumpkinseed 2.3–2.9 cm). (The young pickerel, fish eaters in the live sim, come out small: ~4 vs 7 cm by September)
  // (SEED_M 1.2 → 1.6, 2026-10-19: since predation on the young by density (Y1) and stage P's predators the live spring keeps fewer
  // young — the gate's seed 519 on May 20, seeded/live: perch 2.65 → 2.27×, pickerel 1.4 → 1.1×, suckers 1.4 → 1.36×; a 3-seed
  // recalibration belongs with stage R's first winter as young)
  SEED_P: [0.73, 0.5], SEED_P_YF: [0.28, 0.34], SEED_M: 1.6,
  SEED_SPREAD: 10 * 86400,   // s: a population's spawning, once its water reaches the temperatures, spread over its first ~10 days (the
                             //   live sim: perch 49 of 52 within ~5 days, suckers over ~4, pickerel ~18)
  // WHO GETS A BRAIN (docs/FISH_CENSUS.md §3; the human: "some things like minnow that are always in schools can just have one
  // agent", "if there are enough agents … the larger ones can still be their own; we want this as complex and realistic … as we
  // can"): a budget of AGENTS_HA agents a hectare of lake (≈ 300,000 over the real lakes; the brook's own dace aside). The young
  // of the solitary species live in groups until they reach their size (S3 group: [cm, fish a group] — young sunfish school,
  // young bullheads keep together); the schooling species (S3 solo) give their fish brains of their own from the largest down
  // while the budget lasts — a school whose fish reach the cutoff (soloL, recomputed every SOLO_EVERY days) breaks up into
  // individuals (each a fresh mutation of the school's genome, as recruits are), which school by their own brains (SOLO_COHERE)
  AGENTS_HA: 470, SOLO_COHERE: 0.6, SOLO_EVERY: 10,
  MERGE_EVERY: 10,      // steps between the schools' merge/split pass (with a focus: every FAR_BLOCK s)
  // FIDELITY BY DISTANCE (TRUE_SCALE.md T3): with a FOCUS (the camera's — setFocus), the fish within its radius live second by
  // second while the rest bank their time and, as it reaches FAR_BLOCK s, live it as one coarse block (their own brain deciding
  // once, then going where it chose); a fish coming into the radius first lives its banked time as a block. FOCUS_HYST: the
  // radius × this to leave it (no flicker at its edge). The far fish's blocks are staggered by id, so each fine step carries
  // ~1/(FAR_BLOCK/dt) of them
  FAR_BLOCK: 60, FOCUS_HYST: 1.15,
  FRESH_HASH: 1,        // a coarse block's strikes and mate searches through the hash rebuilt after every fish moved (0: the block's start — before G3)
  HASH_EVERY: 10,       // fine steps between the whole lakes' hash (and counts, biomass) with a focus: the far fish live in blocks
  REGION_M: 50,         // m about the focus's edge its own hash covers (the near fish's senses, strikes and close mates; a second's swim)
  MERGE_R: 2.5, MERGE_LR: 1.2, MERGE_MAX: 1.6, SPLIT: 2,
};

// ============================================================ the species in 3-D ======================================
// THE BROOK'S NEST SITES (runK: spawning fish a m² of the brook holds at once — research_notes/Whole lake 3D fish simulation/
// fallfish_spawning_brook.md): fallfish spawn on pebble mounds each built by one male, 3–5 females and 1–2 satellite males to a
// rush and ~20 about a nest, 5–15 nests in a 154-m brook → 50–300 spawning at once (~150 best guess). A runner that finds the
// brook full spawns on its lake's shoals that season, as Maine's lake fallfish do on gravel margins and in the lakes' other streams
// (outside the sim). At true scale the brook is its real 0.03 % of the lakes: without the limit a tenth of the lakes' fallfish
// (5,400) packed into it and ate its dace at ~30 % a week; the field's dace lose ~2–3 % a week to everything
// Per species: school size (0 = individuals), the census (fish ≥ minL cm — 7.5 unless set — per hectare of lake: docs/FISH_CENSUS.md;
// only the species actually in the lakes — the human, 2026-10-16),
// cruising and sprint speeds (body lengths/s), turning (rad/s), sense range (m, clear water, full light; nonVis the
// fraction kept in the dark — lateral line, smell), strike reach (m), cohesion with its own kind, home range (m).
// found: the founders' length as a share of the growth curve's (species.js vb is a prior from unstunted lakes; Maine's
// crowded yellow perch stay ~20 cm as adults — docs/HOT_BROOK_3D.md §4; the white perch: near-normal, see its entry).
// tPref the temperature it seeks (°C). HAB: the habitat it chooses — the bottom depth it wants to be over (m; Upper's — in the
// shallower Lower a fish wanting deeper water finds the deepest there is), its place in the column (v 0: h m above the bed;
// 1: the fraction h of the column; 2: h m below the surface) and its activity (× cruise), by day, by night and in winter.
// Values: docs/research_notes/Whole lake 3D fish simulation/habitat3d.md §9 (sources per cell; cruising speeds the field's,
// sustain its 30-min speed and sprint its 3-s burst on the DFO fatigue curves — Katopodis & Gervais 2016).
const H = (bot, v, h, act) => ({ bot, v, h, act });
export const S3 = {
  // pumpkinseed (both lakes: MDIFW's 2007 list had it in Upper only and the founders lived there — `only: UPPER` — until MDIFW's 2024
  // chart for Lower listed it too): within ~25-30 m (real) of shore in the weeds, pairs and small groups; rests by the bed in cover at night;
  // near-still below 8 °C (Reeve 2022)
  sunfish:    { larvO: 0.3, larvRmax: 0.22, cycRob: 0.4, school: 0, group: [7, 25], perHa: 50, cruise: 0.75, sprint: 9, sustain: 2.5, turn: 3.0, sense: 2.5, nonVis: 0.2, strikeR: 0, cohere: 0.2, home: HOME(25, 45), tPref: 28,
    hab: { day: H([0.3, 2.5], 0, 0.7, 0.7), night: H([0.3, 2.5], 0, 0.15, 0.35), winter: H([1.5, 3.5], 0, 0.25, 0.05) } },
  // yellow perch: schools of 50-200 over open mud and sand offshore by day; at dusk inshore along the bed, resting on it at night
  // (Imbrock 1996; Hasler & Bardach 1949); the deepest basin in midwinter, active by day under the ice; prefers 18-22 °C.
  // BY SIZE (habJ): perch to ~15 cm keep by day to the weed edge and the open bottom beyond it, over 1.5-4 m, the large ones taking the
  // offshore water — sub-adults and juveniles littoral, larger perch pelagic (Crystal Lake, Wisconsin: Mrnak et al.; Feucht et al.
  // 2023); perch > 22 cm offshore over open bottom, never in the weeds (Lake Sinai, SD: Bauer 2006); perch with predators turn
  // littoral and benthic at ~8 cm (Lippert et al. 2007); schools sorted by size (Krieger & Terrell 1983). Lakes 4-5.5 m deep with
  // weeds to ~3.5 m have little offshore refuge (research predator_diets_and_prey_mortality.md §6). Without it every perch held the
  // deep band by day, where the pickerel (0.5-2.5 m) met a perch 1/20 as often as a killifish — the lake's most numerous prey all
  // but out of its predators' reach (docs/FINDINGS.md). IN WINTER (habJ.wbot) the young keep to 1.5-3.5 m: in shallow "dishpan"
  // lakes perch are at 1.2-2.4 m at first ice, "in around healthy green vegetation", deeper as winter goes on, near the bottom
  // whether in 3 m or 9 m (MN DNR; anglers — research Seasonal fish habitat use/perch_pickerel_smallmouth_pumpkinseed.md §1) —
  // the pickerel's winter water, where the field puts perch first in their winter diet (predator_diets_and_prey_mortality.md
  // §1.4); the large perch the deepest water. With every perch in the deepest hole all winter, the pickerel's only winter fish
  // were the killifish and the young bass
  perch:      { larvO: 0.4, cycRob: 0.4, school: 80, solo: true, perHa: 500, found: 0.8, cruise: 0.75, sprint: 13, sustain: 2.6, turn: 2.6, sense: 3.0, nonVis: 0.2, strikeR: 0.6, cohere: 0, home: HOME(60, 300), tPref: 20,
    hab: { day: H([3.0, 5.5], 0, 0.7, 0.8), night: H([0.5, 2.5], 0, 0.1, 0.25), winter: H([3.9, 5.5], 0, 0.5, 0.4) }, habJ: { L: [15, 22], bot: [1.5, 4.0], wbot: [1.5, 3.5] } },
  // white sucker: loose groups on gentle flats, deep by day, inshore and active at night; the deep flats in winter (E3b spawnP: only 25–50 % of adults spawn in a year — Geen 1966)
  sucker:     { spawnP: 0.4, school: 0, perHa: 70, cruise: 0.75, sprint: 10, sustain: 2.0, turn: 2.0, sense: 2.0, nonVis: 0.6, strikeR: 0, cohere: 0.2, home: HOME(80, 230), tPref: 18,
    hab: { day: H([2.5, 5.5], 0, 0.2, 0.5), night: H([0.5, 2.5], 0, 0.2, 0.8), winter: H([3.5, 5.5], 0, 0.2, 0.3) } },
  // brown bullhead: on the bed in soft weedy coves by day; out over the open mud flats once the light falls below ~1 lux, foraging
  // by taste and smell (Eriksson 1978); BURIED IN THE MUD IN WINTER — "often buries in soft, leafy ooze or mud … with only mouth
  // and gills exposed" (research_notes/Seasonal fish habitat use/whiteperch_shiner_sucker_bullhead.md): bury, its cover then
  catfish:    { school: 0, group: [10, 25], perHa: 100, bury: 0.9, cruise: 0.45, sprint: 7.5, sustain: 2.1, turn: 2.2, sense: 1.5, nonVis: 0.8, strikeR: 0, cohere: 0.2, home: HOME(40, 120), tPref: 28,
    hab: { day: H([0.5, 3.0], 0, 0.02, 0.1), night: H([0.3, 2.5], 0, 0.1, 0.6), winter: H([1.0, 4.0], 0, 0.0, 0.0) } },
  // white perch: schools offshore over level fine sediment by day, 0-2 m over the bed; onto the 0.9-1.5-m flats at night; the
  // open basin's deepest water under the ice, compact and roaming. NEAR-NORMAL GROWTH at ~450/ha (the human, 2026-10-18: the
  // white perch they catch here are "probably bigger than 6 to 8" in; FISH_CENSUS.md "The size splits revisited": the census's
  // 750/ha held only for stunted fish — ~47 g, none over 22 cm — while moderately rich water, abundant bass and pickerel and the
  // Washington County lakes' normal-sized white perch point to near-normal growth): founders at 0.85 of the growth curve
  // (~55/35/10 % at 7.5–15 / 15–22 / > 22 cm, ~71 g), was 0.72 at 750/ha
  whiteperch: { larvO: 0.5, cycRob: 1, school: 80, solo: true, perHa: 450, found: 0.85, cruise: 1.0, sprint: 13, sustain: 2.6, turn: 2.6, sense: 3.0, nonVis: 0.25, strikeR: 0.5, cohere: 0, home: HOME(80, 400), tPref: 28,
    hab: { day: H([3.5, 5.5], 0, 1.0, 0.7), night: H([0.5, 1.5], 1, 0.5, 0.6), winter: H([3.9, 5.5], 0, 1.0, 0.5) },
    habJ: { L: [8, 12], bot: [2.4, 3.6] } },   // (juveniles inshore: "in lakes at 2.4-3.6 m" — Stanley & Danie 1983; ♀ mature at 9-10 cm)
  // smallmouth bass: solitary, within ~50 m (real) of shore on rock, drop-offs and wood; shallower at night; a few deep wintering
  // sites, nearly still Dec-Mar (Sergio 2026; Suski & Ridgway 2009); ~1 BL/s around the clock in summer (Cooke 2001)
  bass:       { larvO: 0.05, cycRob: 0.4, school: 0, perHa: 40, cruise: 1.0, sprint: 7, sustain: 1.9, turn: 2.4, sense: 4.0, nonVis: 0.25, strikeR: 1.0, cohere: 0, home: HOME(50, 700), tPref: 25,
    hab: { day: H([1.5, 4.0], 0, 0.8, 0.8), night: H([1.0, 2.5], 0, 0.2, 0.3), winter: H([2.5, 5.5], 0, 0.0, 0.05) } },
  // chain pickerel: a solitary ambusher in the weeds and their edges, 0.3-1.5 m over the bed; low in cover at night; within ~30 m
  // (real) of shore under the ice, day-active (the ice-fishery's fish); the steepest speed curve (0.5 BL/s sustained, 7.5 burst)
  // yCover: its YOUNG weigh a spot's food by its cover — food × (1 − yCover + yCover · cover): pike under ~14 cm stay in dense
  // vegetation larger pike can't reach (Grimm 1994), juveniles need 35–70 % macrophyte cover (Casselman & Lewis 1996), and in Maine
  // largemouth eat the young pickerel, confined to weed patches (MDIFW) — esocid_first_year_survival.md. OFF (0): at 0.8 the young
  // pickerel crowded into the weeds' best cover, where the larva-eating panfish and the adult pickerel are, and fewer recruited
  // (true lakes, seed 612: 1,799 against 2,657 — larvae eaten 15 % a fortnight against 10 %, the 5–7-cm young starving more). AGAIN
  // with the realistic beds and cover only in the weeds (stage 7h; seed 611, the young held in the canopy): 2 against 257, eaten 45 %
  // in the first fortnight against 14 % — in late May the beds are barely up, the young crowd into the few covered spots and their
  // schools merge, and a predator at a school eats at its full rate whatever its spread: aggregating makes them easier, not
  // harder (the 0.6-m nearest-school encounter — density-based predation between cohorts is the fix, docs/GPU_SIM.md round 3)
  pike:       { school: 0, perHa: 25, yCover: 0, schoolExp: 0.65, cruise: 0.4, sprint: 7.5, sustain: 0.9, turn: 2.2, sense: 3.5, nonVis: 0.2, strikeR: 1.2, cohere: 0, home: HOME(40, 120), tPref: 25,
    hab: { day: H([0.5, 2.5], 0, 0.9, 0.2), night: H([0.5, 2.0], 0, 0.25, 0.1), winter: H([0.5, 2.5], 0, 0.6, 0.1) } },
  // THE FOUR OF THE 3-D's OWN (species3.js; docs/FISH_CENSUS.md; behaviour: docs/research_notes/Whole lake 3D fish simulation/
  // habitat3d_new_species.md — speeds from the DFO fatigue curves, the sunfish group for redbreast and the weak-swimming
  // killifish, the salmon–walleye group for the cyprinids). Redbreast sunfish: by rock and wood in slow current (≤ 35 cm/s) and
  // vegetated margins, sedentary (two-thirds moved < 100 m), into 15–46-cm shallows above ~17 °C, gathered in deep slow water
  // below 5 °C (COSEWIC); the human's brook fish — half the redbreast near the brook summer in its pools
  redbreast:  { larvO: 0.3, larvRmax: 0.22, cycRob: 0.4, school: 0, group: [7, 25], perHa: 50, cruise: 0.75, sprint: 8.6, sustain: 2.4, turn: 3.0, sense: 2.5, nonVis: 0.2, strikeR: 0, cohere: 0.2, home: HOME(20, 80), tPref: 27,
    hab: { day: H([0.3, 2.0], 0, 0.4, 0.6), night: H([0.3, 2.0], 0, 0.15, 0.4), winter: H([1.5, 3.5], 0, 0.25, 0.05) } },
  // fallfish: gravel and cobble near the mouths and the brook's pools, solitary adults, loose juvenile shoals; densest near
  // flowing water (EMAP 9–23 % of adults in lakes with streams; Maine rivers 50–200 a km) — founders weighted to the brook's
  // ends (nearBrook m); a visual drift feeder with an evening feeding peak, partly piscivorous above 10 cm
  fallfish:   { larvO: 0.2, school: 0, group: [12, 20], perHa: 85, nearBrook: 400 * GEO.SCALE, brookYoy: true, cruise: 1.0, sprint: 12, sustain: 2.4, turn: 2.8, sense: 3.0, nonVis: 0.25, strikeR: 0.5, cohere: 0.15, home: HOME(50, 300), tPref: 22.3,
    hab: { day: H([0.5, 2.5], 0, 0.5, 0.6), night: H([0.5, 2.5], 0, 0.25, 0.4), winter: H([2.0, 4.0], 0, 0.3, 0.2) } },
  // banded killifish: size-sorted shoals of 25–40 near the surface over the plant-covered shelf by day (74–93 % of seine
  // catches ≤ 1.2 m); into deeper rocky water near the bed at night; deeper and quiescent below ~12 °C (COSEWIC 2014). Counted
  // whole from age 1 (minL: the yearlings' spring length)
  killifish:  { larvO: 0.2, school: 40, perHa: 233, minL: 4, cruise: 1.0, sprint: 12.5, sustain: 3.4, turn: 3.0, sense: 2.0, nonVis: 0.2, strikeR: 0, cohere: 0, home: HOME(30, 60), tPref: 21,
    // (stage P2: by day the shelf's shallowest water, 0.1-0.6 m — "often in water under 6 in" (CT DEEP), moving shallower where bass
    // are (Dunlop 1987; Gabora & Colgan 1990), below the pickerel's 0.6-3 m: the refuge that lets them live with pickerel, as Hot
    // Brook's have for a century (research predator_diets_and_prey_mortality.md §5.2). Over the whole shelf, 0.1-1.3 m, the true
    // lakes' killifish spent ~3/4 of the day over water ≥ 0.6 m, where the pickerel are (scratchpad where.mjs, July))
    hab: { day: H([0.1, 0.6], 2, 0.15, 0.8), night: H([1.0, 2.5], 0, 0.25, 0.3), winter: H([1.5, 3.0], 0, 0.25, 0.05) } },
  // blacknose dace: the BROOK's own (brookRes): on the bed of its riffles and runs (15–45 cm/s over gravel, under cover), resting
  // there at night; day-active; its pools in winter; ~0.8 a m² of the brook from age 1 (Catskill streams: 1.1 dace a m² of all ages
  // in July–August, the year's young among them, and 2.2 fish of all kinds — 3–4-pass depletion, Baldigo et al. 2008; at 1.5 from
  // age 1, the summer's recruits took the brook to ~2.7 a m² and grazed its insects to their refuge — the dace starved). (The night in the pools was an inference; there the pickerel took
  // ~430 of ~500 a season — bass in streams hold the pools > 50 cm and push small fish into the shallow riffles: brook_food_web.md)
  dace:       { larvO: 0.2, school: 0, perM2: 0.8, brookRes: true, brookYoy: true, minL: 3.5, cruise: 1.0, sprint: 19.4, sustain: 3.9, turn: 3.0, sense: 2.0, nonVis: 0.4, strikeR: 0, cohere: 0.2, home: 24 * GEO.BROOK_SCALE, tPref: 21,
    hab: { day: H([0.15, 0.5], 0, 0.1, 0.8), night: H([0.15, 0.5], 0, 0.05, 0.2), winter: H([0.8, 1.2], 0, 0.05, 0.2) } },
  // (E8) sea-run alewife: pelagic schools — offshore and lower in the column by day, up and inshore at night (sea_run_alewife.md); none
  // founded — they come in on the run (config ALEWIFE) — and their young never recruit (noRecruit); the young's ladder's adult-Daphnia
  // rung at half their length (zooLadderK: no prey over 1 mm until 25–30 mm); the young's UILT is theirs (uiltY: CTO 24, CTM 26, CTL 29; the
  // adults' 23.5 °C would kill them in July) [speeds, home: inf — a clupeid cruiser]
  alewife:    { larvO: 0.5, larvNight: 1, cycRob: 1, school: 300, perHa: 0, run: true, noRecruit: true, zooLadderK: 0.5, uiltY: 30, cruise: 1.2, sprint: 15, sustain: 3.0, turn: 2.6, sense: 3.0, nonVis: 0.3, strikeR: 0, cohere: 0, home: HOME(200, 600), tPref: 20,
    hab: { day: H([2.0, 5.5], 0, 0.8, 0.6), night: H([0.5, 3.0], 1, 0.4, 0.6), winter: H([3.0, 5.5], 0, 0.5, 0.3) } },
};
// MOVING BETWEEN THE LAKES (F3.ROAM_L; movement_between_lakes.md's starting values, [inf]): settle — the chance a year that a
// fish (a school) settles in the other lake, in its season yf [from, to] when given (perch: September–October); trip — the
// chance a year of a trip through the brook into the other lake and back, in its season, lasting tripD days
const MOVE3 = {
  sunfish: { settle: 0.1 }, redbreast: { settle: 0.05 }, perch: { settle: 0.15, yf: [0.5, 0.67] }, whiteperch: { settle: 0.15 },
  sucker: { settle: 0.07 }, catfish: { settle: 0.05 }, bass: { settle: 0.05 }, fallfish: { settle: 0.1 }, killifish: { settle: 0.1 },
  pike: { settle: 0.05, trip: 0.15, tripYf: [0.13, 0.22], tripD: 28 },   // (ice-out ~Apr 23 to mid-May; back in 3–8 weeks)
  dace: {},   // (the brook's own)
};
// SPAWNING GROUNDS (habitat3d.md §9's spawn rows and §11): the bottom depth it spawns over (m) and h m over the bed; site
// 'brook' — up the brook to its riffles; faith (m): a nester comes back within this of last year's nest (smallmouth: ~20 m
// real); brook (pumpkinseed): the share of the fish that move into the brook's pools for the summer (Lievense 1947; the angler)
// sites: the species' traditional spawning grounds per lake — the pairing species meet there (pickerel's marshy coves, bass
// nesting areas, pumpkinseed colonies; a sparse species could not find mates by wandering in a two-week window)
// sub: the structure a plant spawner lays on (plants3 spawnS: 'rigid', 'mat', 'plant') and bare: its eggs' hatch on bare bed
// against on full structure — yellow perch eggs hatched 46 % on bare bottom against 99 % on artificial vegetation (Ward & Barnes
// 2020: 0.47); chain pickerel and banded killifish (eggs on plants, the pickerel's larvae hanging on them ~10 days) 0.3,
// inferred (spawning_on_plants.md); hatch = sHatch × (bare + (1 − bare) × the index where it spawns)
const SPAWN3 = {
  sunfish: { bot: [0.15, 1.7], h: 0.05, brook: 0.3, sites: 10 }, perch: { bot: [0.5, 2.0], h: 0.3, sub: 'rigid', bare: 0.47 },
  sucker: { bot: [0.2, 0.9], h: 0.05, site: 'brook', sites: 3 }, catfish: { bot: [0.3, 1.5], h: 0.02, sites: 6 }, whiteperch: { bot: [0.3, 1.5], h: 0.3 },
  bass: { bot: [0.5, 1.5], h: 0.05, faith: 20 * GEO.SCALE, sites: 4 }, pike: { bot: [0.3, 1.0], h: 0.3, sites: 4, sub: 'mat', bare: 0.3 },
  // redbreast nests: 0.43 m of water on average (0.25–0.6), sand to fine gravel within 1 m of rock or wood, mostly > 5 m apart
  // (COSEWIC); the brook's fish spawn in it. Fallfish: in Maine they run from the lakes into streams to spawn (Trial et al. 1983)
  // — males' pebble mounds at the run and riffle heads ≤ 0.5 m, communal, from 15 °C (the lake's fish far from the brook on
  // gravel shoals). Killifish: on plants (Potamogeton) at 0.2–1 m, ~3 clutches. Dace: en masse over riffle gravel < 0.25 m
  redbreast: { bot: [0.25, 0.6], h: 0.05, brook: 0.5, sites: 8 }, fallfish: { bot: [0.15, 0.5], h: 0.05, site: 'brook', sites: 4, runK: 150 / 1725 },
  killifish: { bot: [0.2, 1.0], h: 0.2, sub: 'plant', bare: 0.3 }, dace: { bot: [0.1, 0.3], h: 0.02, site: 'brook' },
  alewife: { bot: [0.15, 1.0], h: 0.1 },   // (E8: at night along the shallows, 0.15–1 m, over sand, gravel, plants and detritus — a school spawns within itself)
};
// THE BROOK: its path from Upper's outlet (vertex 0) to Lower (the last) — the pool below the mouth (vertices 1–2, ~1 m), the
// riffles (3 and 6, ~0.3 m), the run between (4–5, ~0.5 m). Fish go in and out along it (Fish3._route)
const BP = GEO.BROOK_PATH, BLAST = BP.length - 1;
// each lake's GATE from the brook: its water cell beside the brook's nearest that lake's end of the brook's path (≥ 0.3 m deep) —
// where a fish leaving the brook for the lake goes out through the mouth (the path's end lies inside the brook's mouth, and a
// straight line from there to a goal in the lake can cross the bank)
export const GATE = (() => {
  const g = {};
  for (const [lake, end] of [[UPPER, BP[0]], [LOWER, BP[BP.length - 1]]]) {
    let best = null, bd = Infinity;
    for (let i = 0; i < GEO.N; i++) {
      if (GEO.body[i] !== BROOK) continue;
      for (const j of [i - 1, i + 1, i - GEO.NX, i + GEO.NX]) {
        if (j < 0 || j >= GEO.N || GEO.body[j] !== lake || GEO.depth[j] < 0.3) continue;
        const [x, y] = GEO.cellCentre(j), d = (x - end[0]) ** 2 + (y - end[1]) ** 2; if (d < bd) { bd = d; best = [x, y]; }
      }
    }
    g[lake] = best || end;
  }
  return g;
})();
const nearestBP = (x, y) => { let b = 0, bd = 1e9; for (let k = 0; k <= BLAST; k++) { const d = Math.hypot(BP[k][0] - x, BP[k][1] - y); if (d < bd) { bd = d; b = k; } } return b; };
// the water ≥ 1.5 m nearest each end of the brook in its lake — home for a fish born in the brook
const lakeNear = (b, p) => { let best = null, bd = 1e9; for (let i = 0; i < GEO.N; i++) if (GEO.body[i] === b && GEO.depth[i] >= 1.5) { const [x, y] = GEO.cellCentre(i), d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; best = [x, y]; } } return best; };
export const LAKE_NEAR = { [UPPER]: lakeNear(UPPER, BP[0]), [LOWER]: lakeNear(LOWER, BP[BLAST]) };
const poissonish = r => { const k = Math.floor(r); return k + (rand() < r - k ? 1 : 0); };
export const KEYS3 = SPECIES.filter(k => S3[k]);
// THE LONGEST PREY a fish takes, as a fraction of its own length. A prey's body within the gape is not the whole limit: a slim
// fish — a pickerel, a fallfish — fits a gape at nearly its eater's length, and handling sets the bound (Lawrence 1958: a
// pickerel can swallow any fish as deep as itself). Field maxima across piscivores are 0.32–0.46 of the predator's length (Gaeta et al. 2018); pike
// take conspecifics to 0.55 (Persson et al. 2006 [sur]); smallmouth ~0.4–0.5 (research_notes/Whole lake 3D fish simulation/
// pickerel_mortality_cannibalism.md). Without it, at true scale the pickerel ate each other at ~1.5 % of the adults a week — a
// 24-cm pickerel within reach of a 26-cm one — where the evidence allows ≤ ~0.1–0.3 %
export const PREY_LR = { pike: 0.55, bass: 0.45 }, PREY_LR0 = 0.45;
// STAGE R ITEM 5 as one package (before the lakes and the GPU are built — the year runner's ?r5=1): the encounter–strike–capture
// rule, and the crayfish of soft Maine water — not common at Hot Brook (the human, 2026-10-20; crayfish nearly vanish below ~2 mg/L
// Ca) — at a fifth of the Michigan-based capacity, preferred no more than fish, 15 % out by day (piscivore_encounter_attack.md §e)
const BASS_JUVW0 = SP.bass.juvW;   // (stageR5 item 5 restores it)
// (stageR5 item 24: each species' zooplankton diet before the package — restored when it is off)
// (stageR5 items 23 and 26: the energy stand-ins' and the bullhead's spawning numbers before the package — restored when it is off)
// (R2·4) the young pickerel's set (stageR5): the adult pike set's temperature curves; Cmax W^−0.24 continuous at 10 g; R Q10 2.5 equal at 22.5 °C
// (E3) an egg's development a day at T °C (EGG3: 'kam' D = a/(T − t0), 'exp' D = a·e^(−bT)), and its yolk-sac larva's (its own exp, or yolk × the egg's time)
function eggRate3(P, T) { return P.form === 'kam' ? (T > P.t0 ? (T - P.t0) / P.a : 0) : Math.exp(P.b * T) / P.a; }
function yolkRate3(P, T) { return P.yolkA ? Math.exp(P.yolkB * T) / P.yolkA : eggRate3(P, T) / P.yolk; }
const PIKE_JUV = (() => { const a = SP.pike.bio; return prepBio({ ...a, CA: a.CA * Math.pow(10, a.CB + 0.24), CB: -0.24, RQ: Math.log(2.5) / 10, RA: a.RA * Math.exp((a.RQ - Math.log(2.5) / 10) * 22.5), FA: 0.13, UA: 0.0805, SDA: 0.14, src: 'the young pickerel: Bevelhimer et al. 1985 below 10 g with the larval mass exponent (Wieser et al. 1992), Q10 (Woynárovich 1960) and losses (Schoenebeck et al. 2008)' }); })();
const BIO0 = { wpM: SP.whiteperch.M, wpMaxAge: SP.whiteperch.maxAge, wpK: WINTER0.K.whiteperch, sunfish: [SP.sunfish.bio.RA, SP.sunfish.bioJuv.RA], redbreast: [SP.redbreast.bio.RA, SP.redbreast.bioJuv.RA], fallfish: [SP.fallfish.bio.FA, SP.fallfish.bio.UA], catfishT: SP.catfish.spawnT, catfishJuvW: SP.catfish.juvW, catfishED: SP.catfish.bio.ED };
// (stageR5 item 31: the settle rates before the package — restored when it is off)
const SETTLE0 = Object.fromEntries(Object.entries(MOVE3).map(([k, m]) => [k, m.settle]));
// (FRY.LARV2) a larva-picker of length L (cm), species s: its clearance on larvae, m³/s before its sight and cold (fish_predation_on_larvae.md)
export const larvVol = (s, L) => FRY.LARV_RHO * FRY.LARV_CMAX[0] * Math.pow(L, FRY.LARV_CMAX[1]) * FRY.LARV_COLOUR * (s.larvO ?? 0);
// … and its weight on larvae of length Lq: size against it × detectability
export function larvW(s, L, Lq) {
  const r = Lq / L, [r0, r1] = FRY.LARV_R, rm = s.larvRmax ?? FRY.LARV_R[2], [d0, d1, dm] = FRY.LARV_DET;
  const sr = r < r0 ? r / r0 : r <= r1 ? 1 : r < rm ? (rm - r) / (rm - r1) : 0; if (!(sr > 0)) return 0;
  return sr * (dm + (1 - dm) * clamp((Lq - d0) / (d1 - d0), 0, 1));
}
const M_LARVA30 = FRY.M_LARVA3;   // (stageR5 L1 sets it — restored when off)
const K_FRY0 = PLANKTON.K_FRY;   // (stageR5 R2a sets PLANKTON.K_FRY — shared with the 2-D sim: restored when off)
// (E2c/E2d) THE YOUNG'S ZOOPLANKTON LADDER at length L (cm) on year-fraction yf (config ZOO3.SMALL): c the catch of each field (Daphnia, copepods,
// rotifers, small cladocerans), u its weight in the count response (catch / the class's half-saturation; the copepods' nauplii at K_NAUP, the
// rest at K_FRY) — chem3 zooFeedYoy. Without SMALL the old ladder on one K_FRY (u = c / K_FRY: the old type II exactly)
export function yZoo(L, yf, c, u, dK = 1) {   // (dK: the length scale of its adult-Daphnia rung — S3 zooLadderK)
  const P = PLANKTON, Z = ZOO3, K = P.K_FRY, ramp = (x, a) => clamp((x - a[0]) / (a[1] - a[0]), 0, 1);
  const cR = P.FRY_ROT_MIN + (1 - P.FRY_ROT_MIN) * clamp((P.FRY_ROT_L[1] - L) / (P.FRY_ROT_L[1] - P.FRY_ROT_L[0]), 0, 1);
  if (!Z.SMALL) { c[0] = P.FRY_DAPH_MIN + (1 - P.FRY_DAPH_MIN) * clamp((L - P.FRY_DAPH_L[0]) / (P.FRY_DAPH_L[1] - P.FRY_DAPH_L[0]), 0, 1); c[1] = P.FRY_COPE; c[2] = cR; c[3] = 0; for (let i = 0; i < 4; i++) u[i] = c[i] / K; return; }
  const nS = naupShare(yf), cN = Z.NAUP_MIN + (Z.NAUP_C - Z.NAUP_MIN) * (1 - ramp(L, Z.NAUP_L)), cCa = Z.COP_MIN + (1 - Z.COPE_ESCAPE - Z.COP_MIN) * ramp(L, Z.COP_L);
  const cS = Z.S_MIN + (1 - Z.S_MIN) * ramp(L, Z.S_L), kR = Z.K_ROT * Math.pow(K / Z.K_ROT, ramp(L, P.FRY_ROT_L)), kN = Z.K_NAUP * Math.pow(K / Z.K_NAUP, ramp(L, Z.NAUP_L));
  c[0] = Z.D_JUV * cS + (1 - Z.D_JUV) * (Z.D_MIN + (1 - Z.D_MIN) * ramp(L * dK, Z.D_L)); c[1] = nS * cN + (1 - nS) * cCa; c[2] = cR; c[3] = cS;
  u[0] = c[0] / K; u[1] = nS * cN / kN + (1 - nS) * cCa / K; u[2] = cR / kR; u[3] = cS / K;
}
const DIET0 = Object.fromEntries(['whiteperch', 'sunfish', 'redbreast', 'fallfish', 'dace', 'perch'].map(k => [k, { plank: !!SP[k].diet.plankton, Lzoo: SP[k].Lzoo }]));
export function stageR5(on = true) {
  F3.STRIKE2 = on ? 1 : 0;
  // (item 6: the water it holds — F3.ENC_DZ — and the killifish's own water by day, the shelf's very edge: shoals netted whole in
  // 15 cm of water 2.5 m from shore (Ward et al. 2002), "a few inches below the surface", "often in water under 6 in" (CT DEEP) —
  // under a 30-cm pickerel's 0.3 m (F3.SHALLOW_K), where at 0.1-0.6 m they lost 60 % in a June fortnight)
  // (R1: ENC_DZ off again — it patched the 6-m disc smearing a shore's slope, a 10×-amplified artifact of the 1/10 lakes (6 m spans
  // ~0.7 m of bed there, ~0.07 m on the true lakes); SHALLOW_K and the killifish's strip carry the shallows' refuge; and being
  // symmetric it also hid the prey just deeper than a predator — the weed edge's perch and white perch. audit_predation.md 2a)
  F3.ENC_DZ = 0; S3.killifish.hab.day.bot = on ? [0.05, 0.35] : [0.1, 0.6];
  // (item 6f: and at night the shallows too — in Lake Opinicon, with bass and pike, killifish schools disperse into < 0.6 m at night
  // (Helfman 1981, via McInerny & Cross [SEC]); the 1-2.5-m night band was an inference from fyke catches of "some nocturnal
  // movement" (COSEWIC). With it, 43 % of the killifish's deaths came over > 0.6 m, where they spent 7 % of the day (arms G, H))
  S3.killifish.hab.night.bot = on ? [0.1, 0.6] : [1.0, 2.5];
  // (and the young bass's own water: age-0 smallmouth stay within ~88 m of the nest, solitary among stones over cobble and sand in
  // the shallows; age 1-4 in small groups in the shallow littoral, 25-28-cm Maine bass still shallower than large adults (Ridgway
  // 2002; Cole & Moring 1997) — over 0.4-2 m by day, 1-3 m in winter, blending to the adults' water from 12 to 25 cm (research
  // juvenile_refuges_and_bass_young.md (a)). Without it the 6-cm recruits joined the adults' 1.5-4-m water and in August were
  // 53-72 % of the bass's kills, where field stomachs hold ~no young bass (Maine 0 of 36, Wisconsin 0 of 303))
  S3.bass.habJ = on ? { L: [12, 25], bot: [0.3, 1.2], wbot: [1.0, 3.0] } : undefined;   // (arm S: 0.3–1.2 m for the smallest; it was 0.4–2.0)
  // (item 6e: the bass's shore — summer adults live along the shore near rock and wood, a minority over open water: within 5 m of
  // shore most of the time in a reservoir (Bevelhimer 1995), 79 % of June positions within 50 m (Milipsigate, Sergio 2026), home
  // ranges strips of 0.8-1.7 km of shoreline; out at dusk and dawn (research smallmouth_horizontal_habitat.md). On the depth band
  // alone the median bass was 150-180 m from shore and half the day over the open basin, eating perch schools there; the human:
  // "usually closer to shore, but I've got some in the open area". Shore bands in real m [no pull within, full beyond]; bed 1-3 m
  // by day, 0.5-2 at night)
  S3.bass.shore = on ? { day: [60, 120], night: [50, 100], tw: [150, 250] } : undefined;
  S3.bass.hab.day.bot = on ? [1.0, 3.0] : [1.5, 4.0]; S3.bass.hab.night.bot = on ? [0.5, 2.0] : [1.0, 2.5];
  F3.RECRUIT_SPRING = on ? 1 : 0;   // (the year's young recruit at age 1, in spring)
  F3.BAND_REL = on ? 1 : 0;   // (a narrow band held)
  // (item 6g: the hunger gate (the research: bass G0 0.3–1 %BW, pickerel ~1 %BW — meals of 2.8–4.3 %BW give its 2–3-day interval) with the
  // bass's field strike values in PRED3: research piscivore_field_feeding_rates.md: Maine growth needs p ≈ 0.34 on the sim's own
  // FB4 set (0.7–1.1 kg of food a year; Mille Lacs 0.87 kg), field strikes at fish ~0.3 per hunting hour)
  // (pickerel ungated: at G0 1 %BW the June pickerel fell to p 0.13, 90 % empty, 0.09 kills a day — they were not overfeeding:
  // the true lakes' summer pickerel ran p 0.29–0.31 against ~0.37 (arms H–I))
  // (bass G0 1 %BW, the research range 0.3–1: at 0.5 %BW the true lakes' bass ran p 0.16–0.21 in summer, 76 % empty, ~7,900 starved
  // in a year — arm K; the toy: 0.5 → 1 %BW raises p ~0.28 → 0.35)
  // (pGate after arm W: the gate is the satiation an FB4 fit sets p by — the bass's 0.35 the season-long p Maine growth needs on the
  // sim's set (piscivore_field_feeding_rates.md: 0.30–0.36); at 0.5, with the R1 rule, the bass ran at p 0.55–0.65 and grew to 66 cm)
  F3.HUNGER_GATE = on ? 1 : 0; S3.bass.G0 = 0; S3.bass.pGate = on ? 0.35 : 0;
  // (the review's phase 1, docs/review/PLAN.md item 4: the gate in proportion to its own appetite — pGate 0.5 of Cmax at any size
  // and temperature, in place of G0 1 %BW: that capped p at k·G0/Cmax, 0.35–0.46 for a 250-g bass in summer but 0.20–0.27 for a
  // 15-cm one (gatek.mjs), and let a fall bass store nothing; 0.5 holds ≥ 1.5× maintenance from 9 to 40 cm on the sets below)
  F3.SCOLD = on ? 1 : 0;   // (item 6: strikes at the cold appetite)
  F3.RECRUIT_WARM = on ? 1 : 0;   // (item 7: the spring's recruiting when the water warms past 10 °C)
  // (item 5: a smallmouth runs on Rice's set to 250 g, not 30 — Whitledge's RB −0.756 needs p 0.42–0.70 of Cmax just to hold a 30–60-g
  // bass at 20–24 °C against 0.26–0.32 on Rice's; the two sets' maintenance as %BW a day meet at ~250–300 g, 26 cm, about maturity:
  // probe/bassets.mjs. The species object is species.js's own, shared with the 2-D sim: set here, in the 3-D package)
  S3.bass.sp.juvW = on ? 250 : BASS_JUVW0;
  // (phase 2, items 8–12: the predators meet their real prey — research white_perch_habitat_and_predation.md and the review)
  // (item 8) white perch: the adults on the whole open bottom by day, 2.5–5.5 m (in brown water the light a clear lake's white perch
  // meet at 4–9 m lies at ~1.5–5 m; Missisquoi Bay's 3–4.9-m open water held them at every station), not only the deep hole; the
  // young of the year in the shallows (0.5–2.5 m; Cooper's day seines, Missisquoi's), the 7–15-cm fish between; at night pulled
  // within 20–60 m of shore onto the flats, crossing the weed edge at dusk and dawn (twilight 60–200 m) — where the predators are
  S3.whiteperch.hab.day.bot = on ? [2.5, 5.5] : [3.5, 5.5];
  S3.whiteperch.habJ = on ? { L: [7, 15], bot: [0.5, 2.5] } : { L: [8, 12], bot: [2.4, 3.6] };
  S3.whiteperch.shore = on ? { day: [1e4, 1e4], night: [20, 60], tw: [60, 200] } : undefined;   // (by day no pull: 10 km)
  F3.BAND_LAKE = on ? 0.6 : 0;   // (item 8: Lower's bands within its 3.9 m)
  F3.BASS_SCH = on ? -0.6 : -0.8;   // (item 10)
  F3.PREY_PREF = on ? 0.6 : 0;   // (item 11: the strike's choice by prey size, σ 0.6 in ln units about 0.3 of its length)
  // (item 12) bullheads: spines in the gape test and a bass's poor success on them (Mauck & Coble 1971: least vulnerable; no record of
  // smallmouth eating brown bullhead, Maine ~0 — Cooper 1941; in arm M they were 18 % of the bass's kills)
  S3.catfish.spineW = on ? 1.6 : 1; S3.catfish.cs[1] = on ? 0.05 : 0.2;
  // (item 9) yellow perch take fish by day and at twilight only (visual predators; the review PE12)
  S3.perch.act = on ? [0.3, 0.3, 0] : PRED3.other.act;
  // (phase 4, items 17 and 19: the young's winter — O₂ with room to spare; their unsimulated mortality slower in the cold, × ≤ 3)
  F3.YO2_MARGIN = on ? 2 : 0; F3.YM_COLD = on ? 1 : 0; F3.YM_CAP = on ? 3 : 30;
  F3.YW_T0 = on ? 4 : 0;   // (the young fast below 4 °C, eat in proportion to 10 °C: their growth stops for the winter)
  // (phase 3, items 14–15, and phase 4, item 23: the refuges' settings)
  // (item 15) killifish: the young's day nursery in the very shallow, weedy margin (≤ 0.5 m: inside SHALLOW_REFUGE, full at ≤ 0.2 m)
  // and spawning kept inside the strip (0.1–0.5 m, on plants): with yBed 1.2 and spawning at 0.2–1.0 m, 0.001 % of the young
  // recruited (replacement needs ~0.2 %) and ripe adults left their refuge to spawn
  S3.killifish.yBed = on ? 0.5 : 0; S3.killifish.spawn.bot = on ? [0.1, 0.5] : [0.2, 1.0];
  // (item 14) young pickerel in the weeds' shallows (the stems their refuge from cannibals: Grimm), 12–35 cm over 0.3–1.5 m — about
  // 55 % of the founded pickerel were eaten by bigger ones in year 1; their young schools weighted to the weeds' cover (yCover)
  S3.pike.habJ = on ? { L: [12, 35], bot: [0.3, 1.5] } : undefined; S3.pike.yCover = on ? 0.6 : 0;
  // small bass dug into cover on the bed in cold water (below ~9 °C; ≤ 25 cm) — 63 % of the spring's age-1 bass were eaten within
  // ~6 weeks; young smallmouth winter among rocks and on the bed, near-still (Shuter et al. 1989; MDIFW)
  S3.bass.bury = on ? 0.8 : 0; S3.bass.buryL = on ? 25 : 0;
  // age-1 suckers in the shallows (on the CPU they sat over ~3 m among the perches and 99 % were gone by June) — juvenile white
  // suckers keep to the littoral, the largest moving offshore
  S3.sucker.habJ = on ? { L: [12, 25], bot: [0.5, 2.0] } : undefined;
  // (item 23) the young bottom fish's water: sucker fry < 5 cm feed in 15–20 cm along the shores, young bullheads in quiet coves
  // (SFH §3–4); they sat over 2–3.5 m in June–August
  S3.sucker.yBed = on ? 0.8 : 0; S3.catfish.yBed = on ? 1.5 : 0;
  // (after arm T) THE PERCHES' YOUNG IN THE PREDATORS' WATER: young white perch by day in the shallows, 0.5–2.5 m (Cooper's day seines;
  // Missisquoi Bay's September seines; research white_perch_habitat_and_predation.md), young yellow perch on the littoral bottom from
  // August (Irwin et al. 2009) — the schools had followed the best zooplankton offshore, where of 124–209 M young white perch hatched a
  // year ~20 % were eaten, 13–18 M each by yellow and white perch and 0.1–0.5 M by bass or pickerel, which starved beside them.
  // TRIED AND TAKEN OUT (arm U, yBed 2.5 m for both, seed 613, 3 years): bass and pickerel took only ~35 % more of the young
  // perches (0.73–0.74 M), the small fish and the perches themselves took the rest, more young white perch grew and recruited —
  // white perch 41.5 / 51.4 / 59.6 kg/ha against arm T's 37.2 / 43.3 / 46.4, bass 0.6 against 1.5, pickerel 0.8 against 1.6
  S3.whiteperch.yBed = 0; S3.perch.yBed = 0;
  // (Y2) YELLOW PERCH SCARCE AT ANY SIZE (the human, 2026-10-22: "few perch even ice fishing or with small baits" — ~50–100/ha, like the
  // bass's 40 and the fallfish's 85; FISH_CENSUS.md): the census's 500/ha ≥ 7.5 cm (above its own soft-water comparables, Crystal and
  // Nebish 230–240) set ~50 perch larvae a m² (probe larvz, af3723e) where the field keeps ≲ 10–40 of every species together — the larvae
  // swamped their predators (fish predation Z 0.02–0.05 /d, field 0.035–0.22) and ate the rotifers out (2–7 a litre, field 270–470)
  S3.perch.perHa = on ? 75 : 500; S3.perch.mateCue = clamp(F3.MATE_CUE / Math.sqrt(S3.perch.perHa / 1e4), 6, 40);   // (as the species' set-up)
  // (Y1) THE SUNFISHES' AND THE PICKEREL'S YOUNG IN THE WEEDS (young_first_summer.md §7.2): pumpkinseed larvae leave the nest at 4.5 mm into
  // sheltered weedy bays, ~7× denser there than offshore (Sobchak et al. 2026, Ashby Lake), juveniles in the weed beds 0.7–2.5 m (redbreast
  // as pumpkinseed [inf]); pickerel young in the shore weeds ≤ 1 m. Without it the sunfishes' young followed the zooplankton offshore —
  // 69–97 % over beds deeper than 2 m (probe sunlarva, af3723e) — where the small prey is thinner (inshore ≤ 2 m: rotifers 430–790/L
  // against the open water's 270–470)
  S3.sunfish.yBed = on ? 2.5 : undefined; S3.redbreast.yBed = on ? 2.5 : undefined; S3.pike.yBed = on ? 1.0 : undefined;
  // (item 13) the sunfishes seek cover by day — the small fully, the larger at 0.4 — and hold low in it (h 0.3 m above the bed:
  // within most canopies; the weeds protect only the fish within their height)
  S3.sunfish.seek = on ? { w: 0.6, L: 8, big: 0.4 } : undefined; S3.redbreast.seek = on ? { w: 0.6, L: 8, big: 0.4 } : undefined;
  S3.sunfish.hab.day.h = on ? 0.3 : 0.7; S3.redbreast.hab.day.h = on ? 0.3 : 0.4;
  // (phase 5, item 24) ARM B's DIETS, from the year runner's URL into the package (they were validated only as overrides): the adults
  // of white perch (to 12 cm: Cooper's adults ate the bed's insects, the young zooplankton), the sunfishes (5), fallfish (10) and
  // dace (3) off the zooplankton — and yellow perch take it to 16 cm, not 25 (Cooper: none in perch ≥ 16 cm; they ate 54–94 %
  // zooplankton in early summer). The killifish keep their cladocerans and copepods (Phillips; COSEWIC: arm B had removed them)
  // (item 26) THE ENERGY STAND-INS: the sunfishes run on FB4's bluegill set, whose respiration is 1.2–1.7× the routine O₂ uptake
  // measured on 30-g pumpkinseed (Roberts 1964) — × 0.7 lowers their maintenance from p ~0.40 to ~0.28 (they needed 39–46 % of Cmax
  // to hold weight against the perches' 25–30 %); fallfish adults take their pikeminnow CA/CB's own waste fractions (FA 0.2, UA
  // 0.07), not the dace set's 0.4 / 0.1
  // (R2a: the × 0.7 is Roberts 1964's 30-g ADULT pumpkinseed — not on the juvenile set, whose larvae it put at a third of Breck's)
  SP.sunfish.bio.RA = BIO0.sunfish[0] * (on ? 0.7 : 1); SP.sunfish.bioJuv.RA = BIO0.sunfish[1];
  SP.redbreast.bio.RA = BIO0.redbreast[0] * (on ? 0.7 : 1); SP.redbreast.bioJuv.RA = BIO0.redbreast[1];
  SP.fallfish.bio.FA = on ? 0.2 : BIO0.fallfish[0]; SP.fallfish.bio.UA = on ? 0.07 : BIO0.fallfish[1];
  // (item 23) bullheads spawn late May–June, most eggs in a 10–15-day window, once a year (Blumer 1985): spawnT [21, 28] started
  // at ~19.5 °C (12 June on the sim's curve) and nothing ended it before 1 September — 30–40 % spawned after mid-July
  SP.catfish.spawnT = on ? [18, 24] : BIO0.catfishT; S3.catfish.spawnEnd = on ? 0.38 : 0;
  // (item 26) BULLHEAD GROWTH (research bullhead_growth_and_young_white_perch.md): on FB4's Hartman et al. 2017 set a bullhead
  // needs 0.35–0.56 of its Cmax just to hold weight at 18–24 °C (ration falls as W^−0.225, respiration as W^−0.271), and a 6.5-cm
  // yearling at 70 % of Cmax is still ~12 cm after six years, where northern bullheads reach ~5, 11, 15, 19, 22, 24 cm at ages 1–6:
  // fish under 30 g (~13 cm) stay on the juvenile set (as smallmouth do), and the energy density 6,700 J/g (fatty farmed catfish)
  // → 5,000 (wild ictalurid muscle 3,350–4,780 J/g; no brown bullhead whole-body value found)
  SP.catfish.juvW = on ? 30 : BIO0.catfishJuvW; SP.catfish.bio.ED = on ? 5000 : BIO0.catfishED;
  // (arm S, after arm R — bass fell 6.5 → 2.2 kg/ha in three years: p ~0.2 all year, condition 0.90 → 0.81, crayfish 31 % of their
  // food, insects ~1 %; and the spring's recruits (~9.5 cm) were ~2/3 eaten within six weeks, by bass and white perch)
  // (item 25) INSECTS FOR BASS: a smallmouth darts into the weeds and rises to the surface for the large insects — dragonfly and mayfly
  // nymphs, emergers, fallen insects — 25–40 % of the food of bass ≥ 30 cm and 50–70 % at 15–25 cm (predators.md B14; Cooper's
  // 4 % is a stomach count of large fish): holding ~0.8 m over a 1–3-m bed it was rarely within the weeds' canopy reach or 1 m of the
  // surface. 2 m more reach for both
  S3.bass.insR = on ? 2 : 0;
  // (item 14) the year's bass recruits (≤ 12 cm) keep to cover and the shallows by day (young smallmouth in the rocky shallows,
  // < 1 m), below a large predator's reach; their day band 0.3–1.2 m
  S3.bass.seek = on ? { w: 0.6, L: 12, big: 0 } : undefined;
  // ROCK COVER (S3 rockC up to rockL cm; after arm S — a CPU probe of the small bass's first 60 days: 52 of 75 lost, 48 eaten — by
  // bass 22, pickerel 16, white perch 8 — by day over 0.3–2 m, half of them in no cover; a solitary young bass has no school to hide
  // in, and at 10 cm is the 30-cm predators' preferred size): young smallmouth live among the stones of the rocky shallows (MDIFW:
  // Hot Brook's shores 'rocky with sand and mud areas'), redbreast at stony and wooded margins, young fallfish over cobble
  // F3.COVER_CS: structure cuts the strike's capture success as well as the encounter (Savino & Stein 1982: at high stem densities
  // largemouth caught few bluegill; capture success falls with complexity) — with the encounter alone, a hungry predator striking at
  // its maximum rate took as many small bass in cover as out of it (the probe: 50 of 75 eaten in 60 days with 85 % of them in rock
  // cover ≥ 0.5; with the capture cut too 23, and 46 of the 75 alive at day 60)
  // (R1: cover once, on attack initiation — F3.COVER_ONCE replaces COVER_CS's second count; see F3)
  // (R2a) THE YOUNG'S FOOD AND ENERGETICS AT THE FIELD'S VALUES (audit_habitat_young.md F5–F7): their foods by what each pays
  // (F3.YSHARE); the larvae's ×1.5 Cmax (Breck 1997's bluegill fit, paired there with a higher respiration) only for the sunfishes —
  // perch larvae run at ~0.9× FB4 Cmax; R_WMIN only for the steep sets; the young's half-saturation K_FRY 30 → 60 µg/L, inside its
  // cited 30–75 (Breck: growth falls 0.6 → 0.2 mm/d below ~50 crustaceans/L) — 30 let the young keep cropping at 1–10 µg/L
  // (R2b) the small fish's food: F3.SMALL_S; and the BATCH SPAWNERS' gonads — killifish (~3 clutches of ~200 yolked eggs a season),
  // pumpkinseed and redbreast (several batches) put 0.8 of their surplus into their gonads in season, as the 2-D engine's fathead minnow
  // did (world.js sp.reproAlloc; FEATURES.md 'a batch every ~4 days') — lost in the 3-D port, every species at BIOE.REPRO_ALLOC 0.5:
  // three killifish clutches in ~6 weeks need p ≈ 0.8 at 0.5, 0.6–0.65 at 0.8 (audit_physiology.md C)
  F3.SMALL_S = on ? 1 : 0; for (const k of ['killifish', 'sunfish', 'redbreast']) S3[k].reproA = on ? 0.8 : undefined;
  // (R1b) MORTALITY BY CAUSE — WHITE PERCH, which the census cap alone held: adults' non-predation mortality 0.45–0.65 a year, 'not
  // halved' (Z 0.6–0.8, predation ≲ 0.05–0.10, F 0.02–0.08; white_perch_regulation.md), the sim's 0.45 × 0.5 = 0.23; maxAge 10, M ≈
  // 0.54 with the full share (mOther 1); their young die 3.3× faster than yellow perch's over a first winter (Johnson & Evans 1991), so
  // a harsher WINTER0 ramp than the perch's they shared ([1.04, 0.87] → [1.1, 0.95]); the adults' size slope off (MOTHER_FLAT)
  F3.MOTHER_FLAT = on ? 1 : 0; S3.whiteperch.mOther = on ? 1 : undefined;
  F3.YENC = on ? 1 : 0;   // (R4·6: the young met through the predator's own encounter volume — see F3)
  // (R2·3) the young's depth in the predators' reach, and the young smallmouth's first-summer shallows: solitary after dispersal, in
  // recesses among stones near the nest, < 5 cm fish over sand and rock near shore (Forbes 1981's review; age-0 mean depth 0.34 m in
  // streams, Aadland 1993; most within 200 m of the nest, Ridgway 2002) — S3 yBed 1.0 m in the open-water season
  F3.YDEPTH = on ? 1 : 0; S3.bass.yBed = on ? 1.0 : 0;
  // (E4) THE FISH-EATING WILDLIFE (WILD3: loons, herons, kingfishers, ospreys, the eagles, mergansers, otter, mink — the GPU mirrors it), and
  // the adults' unsimulated M share CUT by what it now takes: BIOE.M_OTHER 0.5 stood in for "disease, parasites, birds and mammals besides
  // the loon, angling". Arm AD (one GPU year, seed 611, the true lakes) counted each species' wildlife deaths against its 'other' deaths:
  // perch 0.61, pumpkinseed 0.66, redbreast 0.43, bass 0.34, pickerel 0.21, fallfish 0.20, white perch 0.18, bullhead 0.16, sucker 0.09 —
  // so mOther = the old share × (1 − that); the killifish's wildlife alone was 2.6× its old share (→ 0); dace unmeasured (the default)
  F3.WILD = on ? 1 : 0;
  // (E5) and cut again by the ANGLERS' share — their deaths a year over the species' 'other' (M × M_OTHER × mOther), from the research's
  // kill [inf: to re-measure by an arm, as E4's]: white perch 0.019 of 0.185, pickerel 0.017 of 0.121, perch 0.006 of 0.048, pumpkinseed
  // 0.008 of 0.046, redbreast 0.008 of 0.084, bullhead 0.005 of 0.113, bass 0.002 of 0.059 (fallfish, sucker < 0.001: unchanged)
  { const MO = { sunfish: 0.14, perch: 0.165, sucker: 0.45, catfish: 0.40, whiteperch: 0.74, bass: 0.32, pike: 0.335, redbreast: 0.25, fallfish: 0.40, killifish: 0 };
    for (const k in MO) S3[k].mOther = on ? MO[k] : undefined; }
  // (E2a) the rotifers' microbial food and field rates, the size-gated interference, their predators feeding the copepods (config ZOO3.MICRO)
  ZOO3.MICRO = on ? 1 : 0;
  ZOO3.DAPH_LIM = on ? 1 : 0;   // (E2b: the grazing-resistant algae and the invertebrate predators of the young Daphnia — config RESALG, ZOO3)
  ZOO3.SMALL = on ? 1 : 0;   // (E2c/E2d: the small cladocerans, the nauplii, the young's prey ladder by gape and by count — config ZOO3)
  // (E9a) the air's synoptic and seasonal anomalies about the Maine calendar: years differ (config WEATHER3)
  WEATHER3.AIR = on ? 1 : 0; WEATHER3.HYDRO = on ? 1 : 0; WEATHER3.SYN = on ? 1 : 0; HERP3.ON = on ? 1 : 0;   // (E6b/E6c1: the herps as consumers)
  CHEM3.N_FORM = on ? 1 : 0;   // (the inflow's inorganic N mostly nitrate: under the ice its nitrification had taken a third of the lakes' O₂ — chem3 N_FORM)   // (E9d: fronts — Houlton's rain days and storms)   // (E9b: rain and snow, the catchment's flow through the lakes)
  ALEWIFE.ON = on ? 1 : 0;   // (E8: the sea-run alewives — config ALEWIFE)
  // (L1) THE CYCLOPOIDS ON THE SMALLEST LARVAE (config FRY.CYC — larval_mortality.md). The field background M_LARVA3 0.02 (from 0.04, fitted
  // before the egg stage) waits for L2, the fish's predation on larvae at its field rate: lowered alone, it lets more larvae live (probe larvz:
  // perch Z 0.046 → 0.029) while the fish take 0.003/d of them against the field's 0.04–0.2 — one compensation would go, its gap stay
  FRY.CYC = on ? 1 : 0;
  // (L2) THE FISH'S PREDATION ON LARVAE AT ITS FIELD RATE (config FRY.LARV2 — fish_predation_on_larvae.md) and with it the field's background
  // M_LARVA3 0.02 (larval_mortality.md: predator-free enclosures 0.01–0.03 /d; its 0.04 was fitted before the egg stage)
  FRY.LARV2 = on ? 1 : 0; FRY.M_LARVA3 = on ? 0.02 : M_LARVA30;
  EGG3.PROLARVA = on ? 1 : 0;   // (E3b: the yolk-sac larvae the fish's prey; the field's egg survival — config EGG3; S3 spawnP — egg_survival_and_larval_production.md)
  EGG3.ON = on ? 1 : 0;   // (E3: the egg stage — clutches on the bed, by cause; sHatch replaced — config EGG3)
  PL3.MOOSE = on ? 1 : 0;   // (E13: moose grazing the shallows' plants in summer, their N and P taken ashore — plants3 PL3.MOOSE)
  F3.YSCHOOL = on ? 1 : 0;   // (R4·6: the young met in their schools by the followed fish's school terms — see F3)
  F3.WIN_JE = on ? 1 : 0;   // (white perch's first winter on Johnson & Evans 1990's measured model — see F3 and config WINTER0.JE)
  F3.YWIN_CS = on ? 1 : 0; F3.RD_SIZE = on ? 1 : 0;   // (R4·6: the young caught by the strike rule's capture success, every prey seen at its own reaction distance — see F3)
  SP.whiteperch.M = on ? 0.54 : BIO0.wpM; SP.whiteperch.maxAge = BIO0.wpMaxAge * (on ? 10 / 12 : 1); S3.whiteperch.maxAge = SP.whiteperch.maxAge / Y2 * YEAR;   // (as the species' set-up)
  WINTER0.K.whiteperch = on ? [1.1, 0.95] : BIO0.wpK;
  // (R2·4) THE YOUNG PICKEREL'S OWN SET (esocid_larval_energetics.md): the adult FB4 pike set (Bevelhimer et al. 1985, fitted on
  // 9–53-g pike eating minnows) grew a 1-cm larva 0.01–0.4 mm/d at a full ration of zooplankton, where pike larvae fed to excess grow
  // 0.25 (10 °C) – 0.45 (12) – 0.5–0.65 (15) – 0.65–0.8 (18) – 0.7–1.0 (21) – 0.8–1.2 mm/d (24; Górny 1992, Fey & Greszkiewicz 2021)
  // — so the pickerel had no year-classes (arm Y). Below 10 g (the fitted range's floor): Cmax's mass exponent −0.24 (Wieser et al.
  // 1992's larval growth exponent; the hatchery SGR's ≈ −0.3), continuous with the adult set at 10 g; respiration's Q10 2.5 (first-
  // feeding pike, Woynárovich 1960) equal to the adult set's at 22.5 °C — the adult's ×0.5 winter cut (Chipps et al. 2000's age-0
  // esocid errors in cold water) stood in for it, and is off for this set (bioenergetics coldResp); the losses of FB4's juvenile
  // esocid set (muskellunge juvenile, Schoenebeck et al. 2008: FA 0.13, UA 0.0805, SDA 0.14). Full-ration growth then 0.23 / 0.31
  // / 0.49 / 0.71 / 0.92 / 0.98 mm/d at 10 / 12 / 15 / 18 / 21 / 24 °C for a 1.25-cm larva on zooplankton: the measured growth, unfitted
  SP.pike.bioJuv = on ? PIKE_JUV : undefined; SP.pike.juvW = on ? 10 : undefined;
  // (R2·4) and their cover again: young pike under ~14 cm keep to dense vegetation (Grimm 1994), juveniles need 35–70 % macrophyte cover
  // (Casselman & Lewis 1996) — S3 yCover 0.8, switched off when the young pickerel in the weeds recruited less: they could not grow
  S3.pike.yCover = on ? 0.8 : 0;
  F3.YSHARE = on ? 1 : 0; F3.RWMIN_STEEP = on ? 1 : 0; PLANKTON.K_FRY = on ? 60 : K_FRY0;
  for (const k of KEYS3) S3[k].cmaxL = on && k !== 'sunfish' && k !== 'redbreast' ? 1 : undefined;
  F3.COVER_CS = 0; F3.COVER_ONCE = on ? 1 : 0; F3.SIZE_RENORM = on ? 1 : 0; F3.EH_AMAX = on ? 1 : 0; F3.REST_DIGEST = on ? 1 : 0; F3.REST_ALL = on ? 1 : 0;
  // (R1) THE PREDATORS' BRAKE IS THE HUNGER GATE: act was arm D's brake against overfeeding, set before the gate existed, and an
  // ambusher hunts while still (Diana's 16–22 % 'active' is movement, not hunting) — now a diel rhythm only (pickerel dawn/dusk
  // peaks, little at night; smallmouth by day, little at night), with pGate 0.4 for pickerel (their field p 0.39–0.42; a meal every ~2.7 days,
  // Diana 1979); the bass's aMax back to its lab ceiling 12 /h (cut to 2.5 at 4875ba0 when bass met prey constantly and the 8-%BW gut
  // was the only brake — a realised field rate used as a ceiling). Field targets: p pickerel 0.39–0.42, bass 0.30–0.36; kills
  // pickerel 0.4–0.8 a day, bass ~1; 35–60 % empty stomachs (piscivore_field_feeding_rates.md)
  S3.pike.act = on ? [0.7, 1, 0.1] : PRED3.pike.act; S3.bass.act = on ? [0.8, 1, 0.1] : PRED3.bass.act;
  S3.bass.aMax = (on ? 12 : PRED3.bass.aMax) / 3600; S3.pike.pGate = on ? 0.3 : 0;   // (0.3 after arm W: at 0.4 the pickerel grew 60 cm by 5, 85 at 8+, against Maine's ~43 cm at 5 — vb Linf 65 — where arm T's summer p ~0.3 matched Maine's lengths)
  // A SCHOOL'S EGGS: its gonads are built to its own ripe GSI, (gsiF + gsiM)/2 (half female, half male) — its ripeness for its
  // eggs was measured against the female's gsiF, so a ripe school laid at most gsi/gsiF of them: 0.59 of a killifish school's
  // (0.095/0.16), ~0.6 of the perches'. Single fish unchanged (killi.mjs: ~900–1,800 eggs a school spawning, ~1 clutch a summer)
  F3.EGG_SCHOOL = on ? 1 : 0;
  S3.bass.rockC = on ? 0.6 : 0; S3.bass.rockL = on ? 15 : 0; S3.redbreast.rockC = on ? 0.5 : 0; S3.redbreast.rockL = on ? 20 : 0; S3.fallfish.rockC = on ? 0.4 : 0; S3.fallfish.rockL = on ? 12 : 0;
  // (item 15) the killifish's strip: by day ≤ 0.25 m and at night ≤ 0.4 m — in arm R, 60 % of their kills were over 0.3–0.6 m, 11 %
  // under 0.3 m where they spent 55 % of their days (the predators' shallow reach)
  S3.killifish.hab.day.bot = on ? [0.05, 0.25] : [0.1, 0.6]; S3.killifish.hab.night.bot = on ? [0.05, 0.4] : [1.0, 2.5];
  // (item 28) THE BROOK'S POOLS HOLD SO MANY: the share of the sunfishes near the brook's ends that summer in it — at 0.3 (pumpkinseed)
  // and 0.5 (redbreast) ~3,200 summered in ~300 m² of its pool water (10.8 per m²: arm M), starving its dace's food; ~0.2–0.5 per m²
  // of the ≥ 0.6-m water is the review's estimate (HSI: abundance rises with depth; the larger move upstream — Hall 1972), ~100–150
  // at true scale. Redbreast are the brook's own sunfish and keep the larger share. (The human sees sunfish in the pools: a count
  // would pin it.) The year runner's 'in the brook' line counts them
  S3.sunfish.spawn.brook = on ? 0.01 : 0.3; S3.redbreast.spawn.brook = on ? 0.02 : 0.5;
  // (item 31) SETTLING IN THE OTHER LAKE at the field's rates (STR #2–3; movement_between_lakes.md): marked fish of connected lakes
  // mostly stay — perch, white perch, the sunfishes 1–5 % a year, bass and bullheads 2–5, suckers 3–10, killifish (weak swimmers,
  // blocked by current) ≤ 1; the starting values (5–15 %) were [inf] and moved fish ~10× too often
  for (const [k, v] of [['sunfish', 0.03], ['redbreast', 0.03], ['perch', 0.03], ['whiteperch', 0.03], ['sucker', 0.06], ['catfish', 0.03], ['bass', 0.03], ['fallfish', 0.05], ['killifish', 0.005], ['pike', 0.03]]) MOVE3[k].settle = on ? v : SETTLE0[k];
  for (const [k, z] of [['whiteperch', 12], ['sunfish', 5], ['redbreast', 5], ['fallfish', 10], ['dace', 3], ['perch', 16]]) {
    const d0 = DIET0[k], noPl = on && k !== 'perch';
    S3[k].plank = noPl ? false : d0.plank; SP[k].diet.plankton = noPl ? false : d0.plank; SP[k].Lzoo = on ? z : d0.Lzoo;
  }
  // (item 6h: the killifish's young — they hatch on the plants of the shelf and stay in its weedy shallows, growing linearly to ~5 cm
  // by mid-October (Keast & Eadie 1984), cladocerans young, midges and amphipods older (Phillips 2007): yBed 1.2 m (74–93 % of
  // seine catches ≤ 1.2 m) and the bed's food from 2 cm (was FRY.BENTH_L 2.5, which they never reached). Without it the young
  // followed zooplankton offshore over ~3.4 m, stalled at ~2 cm, and none reached their first spring — research
  // killifish_persistence_and_predators.md: replacing the stock needs only ~0.2 % egg-to-age-1 survival)
  // (benthL 1 cm: young killifish take the weeds' and the bed's small fauna — chydorids, midges — from 1 cm; at 2 cm they stayed
  // ~1.5–2 cm through the summer (1/10 CPU), against the field's 25.6 mm SL by 21 Sep (Burton's Pond, NL) and 32 mm TL in the fall
  // (Presque Isle) — research killifish population dynamics, 2026-10-20)
  S3.killifish.sp.benthL = on ? 1.0 : undefined;   // (yBed: below, phase 3 item 15 — 0.5 m; it was 1.2)
  // (Y1) THE BED'S FOOD AT THE FIELD'S SWITCH (young_first_summer.md §7.2; FRY.BENTH_L 2.5 cm otherwise): smallmouth young take chironomids
  // and copepods from ~9 mm, insects from ~15 mm; pumpkinseed juveniles at ~20 mm eat chironomids, chydorids, isopods (their tissue
  // plankton-derived 91 % as larvae, 76 % by August); pickerel young insects from ~15 mm before fish (redbreast as pumpkinseed [inf])
  S3.bass.sp.benthL = on ? 1.0 : undefined; S3.sunfish.sp.benthL = on ? 1.5 : undefined; S3.redbreast.sp.benthL = on ? 1.5 : undefined; S3.pike.sp.benthL = on ? 1.5 : undefined;
  // (item 6i: fallfish fish-eating only from 18 cm: adults are insect and drift feeders, fish a large share only in pulses of naive
  // fry, fish ≤ 10–20 % of their diet otherwise, fallfish < 10 cm ate none (research killifish_persistence_and_predators.md); from
  // 10 cm they struck at the perch-like rate and became the killifish's top predator once the bass were gated (arm K: 51k kills))
  // (arm M: at 18 cm the founded adults, ~25 cm, still took 45k killifish; fish in a fallfish's diet are documented only in pulses of
  // naive salmon fry and eggs in rivers — only the largest, ≥ 30 cm, hunt fish here)
  S3.fallfish.sp.Lpisc = on ? 30 : 10;
  // (item 6j: the year's young smallmouth eat plankton and insects to ~10 cm, fish appearing at 10–15 cm (Dunlop 2005; Weidel 2000 —
  // research juvenile_refuges_and_bass_young.md); their schools ate fish from Lpisc 5 cm — in arm M 212k young killifish, 729k young
  // pumpkinseed, 387k young redbreast — so a young bass school takes fish only from 10 cm (yLpisc; its age-0 rarely gets there)
  S3.bass.sp.yLpisc = on ? 10 : undefined;
  F3.YCOLD = on ? 1 : 0;   // (item 6k: the young hunted at the predators' appetite in cold water — see _feed)
  // (the crayfish's capacities ⅕ of the Michigan stock's by habitat: now read as the soft water's CALCIUM — Hot Brook-like lakes 2–4 mg/L, at
  // the crayfish's limit (C. bartonii nearly gone below 2.0 mg/L, Hadley et al. 2015; 'generally rare in Maine', Cooper 1941; the human:
  // not common) [inf: the ⅕ itself]; (E1) the stones by the bed's substrate map, LIT3.SUB_MAP — the rocky area ~⅓ of the old proxy's)
  Object.assign(LIT3, on ? { CR_PREF: 1, CR_OUT: [0.15, 0.6], CR_ROCK: 5, CR_WEED: 3, CR_MUD: 0.4, CR_DEEP: 0.1, SUB_MAP: 1, HEX: 1 } : { CR_PREF: 5, CR_OUT: [0.3, 0.7], CR_ROCK: 25, CR_WEED: 15, CR_MUD: 2, CR_DEEP: 0.5, SUB_MAP: 0, HEX: 0 });
}
// THE PREDATORS' STRIKES (F3.STRIKE2; piscivore_encounter_attack.md): strikes an hour at most when hungry with prey about (esocids
// 1.4–5.8, smallmouth ~12 in half cover, perch-like a prior), its own speed hunting (m/s: the pickerel waits in ambush), its kind
// act: the share of the time it hunts by [day, twilight, night] (sun > 0.3, > 0.02, below) — pickerel 2 % active at night against
// 17–22 % by day, peaks at dawn and dusk; smallmouth ~0.3 by day (piscivore_encounter_attack.md (c)); without it the predators
// hunted round the clock, fed at their maximum and tripled in a summer (arm D, seed 613)

// THE LAKES' FISH-EATING WILDLIFE (F3.WILD; docs/review/ECOSYSTEM_BUILD.md E4; every value from docs/research_notes/Maine lake shores and
// catchment/shore_birds_and_mammals.md unless [inf]). Each is a predator population on the lakes: its calendar (yf, 0 = March 1), its
// number (per pair of the lakes' hectares, or per km of their shore), its daily need (g a bird or mammal), the share of it fish (the rest
// crayfish, frogs, insects — seasonal for otter and mink: winter / summer), the fish lengths it takes (cm: none below L[0], all from L[1]
// to L[2], none above L[3]), where (the fish's depth below the surface: all to z[0], none past z[1]; the bed under it: all to b[0],
// none past b[1]), its activity by [day, twilight, night], whether it hunts under ice, and its preferences by fish species. It takes its
// need from the fish it can reach — each fish's share its mass × its accessibility × the preference — halving when the reachable fish are
// one day's need (Holling II, K = a day's fish [inf]); the rest of its diet is not fish
export const WILD3 = {
  // common loon: ice-out to Oct–Nov; a pair per 40–280 ha (Belgrade 95–280) — 1 per 150 ha [inf]; an adult ~1.1 kg/day (Barr 1996's
  // 423 kg a family-season less two chicks); chicks July on, 160–380 g/day, ~0.6 a pair [inf: Belgrade hatch/fledge]; fish 10–70 g, up
  // to ~300 g, "often yellow perch", streamlined fish; pursuit dives < 10 m, by day
  loon: { yf: [0.14, 0.75], perHa: 2 / 150, need: 1100, chick: { yf: 0.33, perPair: 0.6, need: 250 }, fish: [0.9, 0.9], L: [6, 10, 20, 30], z: [8, 10], b: [99, 99], act: [1, 0.2, 0], ice: 0, pref: { perch: 1.5, fallfish: 1.2, killifish: 1.2, dace: 1.2, alewife: 1.2, sunfish: 0.6, redbreast: 0.6, catfish: 0.5 } },
  // great blue heron: mid-March to ~November; wades ≤ 50 cm (mostly 15–25 cm), fish ≤ 25 cm (mostly ≤ 20), ~300 g/day; dawn and dusk
  // peaks, some night; 1 per 4 km of shore [inf: Maine colonies forage widely]
  heron: { yf: [0.05, 0.70], perKm: 0.25, need: 300, fish: [0.8, 0.8], L: [3, 5, 20, 25], z: [0.5, 0.6], b: [0.3, 0.5], act: [0.6, 1, 0.3], ice: 0, pref: {} },
  // belted kingfisher: fish 4–14 cm (mostly < 10) from the top ~15 cm (never past 60) of water < 60 cm deep; ~70 kcal/day ≈ 60–75 g;
  // ~0.8 km of shore a bird [the note's synthesis]; crayfish 12–21 %, frogs; by day, best at dusk
  kingfisher: { yf: [0.12, 0.70], perKm: 1 / 0.8, need: 65, fish: [0.7, 0.7], L: [3, 4, 10, 14], z: [0.15, 0.6], b: [0.4, 0.6], act: [1, 0.8, 0], ice: 0, pref: {} },
  // osprey: early April – early September; plunges ≤ ~1 m; fish 150–300 g (~25–35 cm), 50–1,200 g; an adult 300–400 g/day, a family
  // 850–1,250; 2 pairs [inf: lakes of 650 ha], their brood from July [inf]; pale, surface-oriented fish — suckers in the shallows
  osprey: { yf: [0.10, 0.52], perLake: 4, need: 350, chick: { yf: 0.30, perPair: 1.5, need: 250 }, fish: [1, 1], L: [15, 25, 35, 45], z: [0.5, 1.0], b: [99, 99], act: [1, 0.3, 0], ice: 0, pref: { sucker: 1.5, catfish: 0.7, alewife: 2 } },   // (E8: ospreys and eagles gather at alewife runs [inf: x2])
  // bald eagle: all year (a pair nests on Upper — the human); inland Maine remains 79 % fish, brown bullhead, white sucker and chain
  // pickerel favoured; ~500 g/day; takes fish at the surface; in winter it scavenges (no open water: none here)
  eagle: { yf: [0, 1], perLake: 2, need: 500, chick: { yf: 0.25, perPair: 1.2, need: 400 }, fish: [0.8, 0.8], L: [18, 25, 50, 60], z: [0.3, 0.6], b: [99, 99], act: [1, 0.3, 0], ice: 0, pref: { catfish: 2, sucker: 2, pike: 1.5, alewife: 2 } },
  // common merganser: broods on lakes and streams; ~255–285 g/day captive (~30 % of body mass), 400 wild; prefers 10–13 cm fish, girth
  // limits; pursuit diver in shallow to mid water [inf: ≤ 3–5 m]; 10 on the lakes [inf: a brood or two]
  cmerganser: { yf: [0.14, 0.75], perLake: 10, need: 300, fish: [0.9, 0.9], L: [5, 8, 13, 18], z: [3, 5], b: [99, 99], act: [1, 0.3, 0], ice: 0, pref: {} },
  // hooded merganser: beaver ponds and small lakes; fish 44 %, crayfish 22 %, insects 13 % of items; small fish in shallow edges
  // [inf: ≤ 2 m]; ~150 g/day [inf]; 4 on the lakes [inf]
  hmerganser: { yf: [0.14, 0.75], perLake: 4, need: 150, fish: [0.45, 0.45], L: [3, 5, 10, 13], z: [2, 3], b: [99, 99], act: [1, 0.3, 0], ice: 0, pref: {} },
  // river otter: all year, roams (routes > 30 km); 1.1–1.8 kg prey/day; crayfish dominate in summer (85 % of scats), fish in winter
  // (13 → ~58 % of scats) — fish share summer 0.15, winter 0.6 [inf from the scat shares]; slow fish (suckers, bullheads, minnows) above
  // their abundance; the whole column, under the ice too; any time, a dawn peak; 1 per 8 km of the lakes' shore [inf: it uses them part-time]
  otter: { yf: [0, 1], perKm: 1 / 8, need: 1400, fish: [0.6, 0.15], L: [8, 12, 35, 50], z: [99, 99], b: [99, 99], act: [1, 1, 0.6], ice: 1, pref: { sucker: 2, catfish: 2, killifish: 1.5, dace: 1.5, fallfish: 1.5, pike: 0.5, bass: 0.5 } },
  // mink: all year, chiefly nocturnal; fish in winter and spring, crayfish in summer; small fish in the shore's shallows [inf: bed
  // ≤ 0.5–1 m]; ~175 g/day [inf: 15–20 % of ~1 kg]; 1.5 to > 3 a km of good shore — 0.5 a km of these lakes' [inf]
  mink: { yf: [0, 1], perKm: 0.5, need: 175, fish: [0.6, 0.2], L: [4, 6, 15, 20], z: [1, 1.5], b: [0.6, 1.0], act: [0.2, 0.6, 1], ice: 1, pref: {} },
  // (E6, the herps — docs/research_notes/Maine lake shores and catchment/turtles_and_frogs.md §4, §6)
  // snapping turtle: common and secure in every region of Maine; northern adults ~1.5 /ha overall (Obbard 1983), Algonquin 1.5–2.4, density
  // falling with the water's size (Crescent Lake) — 1 /ha of these lakes [inf]; an adult eats about its own weight a year (Kiviat 1980): a
  // ~6-kg northern adult [inf] over the ~120 days it feeds (only above 16 °C, Graves & Anderson 1987: late May – mid-September) ≈ 50 g/day;
  // fish a third of Michigan's 173 stomachs (game fish, part scavenged), 'mainly slow, non-game fish' (Hammer 1972; Lagler & Applegate 1943)
  // — 0.2 live [inf] — the rest plants (a third to two-thirds), crayfish, invertebrates, frogs; it ambushes and stalks on the bottom of the
  // shallows [inf: a bed ≤ 2–4 m], rarely basking, day and night
  snapper: { yf: [0.24, 0.56], perHa: 1, need: 50, fish: [0.2, 0.2], L: [4, 8, 30, 45], z: [99, 99], b: [2, 4], act: [0.7, 1, 0.8], ice: 0, pref: { sucker: 2, catfish: 2, sunfish: 1.2, redbreast: 1.2, bass: 0.5, pike: 0.5 } },
  // bullfrog: statewide, common; shallow bays and the weedy edge, males on floating territories 2–5 m across, inactive until the water nears
  // 15 °C (Harding 1997), in the mud from October; 8.8–45.8 /ha (an Illinois lake), 6.6–119 a km of shore — 10 a km of these lakes' [inf: the
  // low end, a northern lake]; ~250-g adults eating ~4 % a day [inf] ≈ 10 g; insects (Hemiptera, Odonata), frogs 5–15 %, crayfish, and small
  // fish ~5 % [inf: Werner, Wellborn & McPeek 1995's Michigan diet lists fish only within 'miscellaneous aquatic' 2–7 %], at the surface of
  // shallow water, mostly at night [inf]. (Green and mink frogs take 'sometimes small minnows' — too few to enter here)
  bullfrog: { yf: [0.22, 0.6], perKm: 10, need: 10, fish: [0.05, 0.05], L: [2, 3, 8, 12], z: [0.3, 0.6], b: [1, 1.5], act: [0.3, 1, 1], ice: 0, pref: {} },
  // (E5) THE ANGLERS (research_notes/Hot Brook populations and water/angling_effort_and_harvest.md): Region F's 1.8 bass-water angler-days
  // an acre a year (1998–99 surveys) → Upper ~12 h/ha, Lower ~4 [inf: a remote, little-developed pair] — ~5,500 angler-hours a year on the
  // real lakes, a fifth through the ice. What dies a day (`need`, g for the lakes — perLake 1) = the season's hours × each species' catch
  // an hour × (the share kept + the released × hooking mortality, ~3 % in open water — 1 % at ≤ 10 °C, 4 % at 20, 7 % at 24 — ~1 % through
  // the ice) × its mean mass, over the season's days. Open water (May–November): white perch 0.5 an hour, 60 % kept (Region F 40 %; the
  // plan's table 53/40 — 60 [inf: the bag of 25]); yellow perch 0.3, 35 % [inf: NY]; bullhead 0.05, 75 %; pumpkinseed and redbreast 0.2,
  // 15 %; pickerel 0.12, 6 %; smallmouth 0.3, none kept (catch-and-release by law) — its hooking deaths only; fallfish 0.1, 5 %; sucker
  // 0.02, 10 % [inf] → ~416 kg a year over 214 days. The ice (January–March; lures-only Oct–Dec, so the bait fishery opens Jan 1):
  // pickerel 0.3 an hour, 21 % kept; white perch 0.3, 68 %; yellow perch 0.3, 50 % [inf]; bass almost never (Washington County) →
  // ~95 kg over 90 days. The preferences: each species' share of that kill over its standing biomass at the founding (white perch 1);
  // the sizes caught and kept 15–20 cm and up; anglers fish by day and at dusk, a few at night (bullhead). Exploitation then ~0–2 % a
  // year (field: Murphy Flowage's heavy, unlimited fishery 2–12 % of its panfish)
  angler: { yf: [0.17, 0.75], perLake: 1, need: 1944, fish: [1, 1], L: [15, 20, 70, 90], z: [99, 99], b: [99, 99], act: [1, 1, 0.1], ice: 0,
    pref: { whiteperch: 1, pike: 0.45, sunfish: 0.38, redbreast: 0.38, catfish: 0.32, perch: 0.29, bass: 0.11, fallfish: 0.07, sucker: 0.04, killifish: 0, dace: 0, alewife: 0 } },
  iceAngler: { yf: [0.836, 0.085], perLake: 1, need: 1055, fish: [1, 1], L: [15, 20, 70, 90], z: [99, 99], b: [99, 99], act: [1, 0.5, 0.1], ice: 1,
    pref: { pike: 1, whiteperch: 0.19, perch: 0.11, sunfish: 0.02, redbreast: 0.02, bass: 0.005, catfish: 0, fallfish: 0, sucker: 0, killifish: 0, dace: 0, alewife: 0 } },
};
export const WILDK = Object.keys(WILD3);
// (the day's share of hours by light: day, twilight, night — the activities' daily mean [inf: a Maine summer's day])
const WILD_HOURS = [0.55, 0.1, 0.35];
export const WILD_LAKE_HA = 643.6;   // (the real lakes' area, ha: Upper 369 + Lower 274)
export const PRED3 = { pike: { aMax: 3, v: 0, cls: 0, act: [0.15, 0.2, 0.02] }, bass: { aMax: 2.5, v: 0.1, cls: 1, act: [0.2, 0.5, 0.05] }, other: { aMax: 4, v: 0.1, cls: 2, act: [0.3, 0.3, 0.05] } };
// capture success of a strike at each prey by [an esocid, a smallmouth, a perch-like predator] (Wahl & Stein 1988 esocids on
// bluegill 0.10–0.14, fathead 0.67, shad 0.78; Mauck & Coble's vulnerability order — soft-rayed most, bullheads least; perch-like
// predators a prior); SPINY: the spiny-rayed and deep-bodied, whose success falls faster with relative size (Scharf et al. 1998)
export const CS3 = { killifish: [0.7, 0.6, 0.5], dace: [0.7, 0.6, 0.5], alewife: [0.7, 0.6, 0.5], fallfish: [0.7, 0.6, 0.5], sucker: [0.7, 0.6, 0.5], pike: [0.6, 0.55, 0.4],
  perch: [0.35, 0.45, 0.3], whiteperch: [0.3, 0.4, 0.25], bass: [0.3, 0.4, 0.25], sunfish: [0.12, 0.55, 0.3], redbreast: [0.12, 0.55, 0.3], catfish: [0.1, 0.2, 0.1] };
export const SPINY3 = { perch: 1, whiteperch: 1, bass: 1, sunfish: 1, redbreast: 1, catfish: 1 }, PPR0 = [0.88, 0.6];   // (soft, spiny)
// (F3.SIZE_RENORM) the prey/predator length ratio each CS3 value was measured at, by the prey's fins [soft, spiny] and the predator's kind
// [esocid, bass, other]: soft-rayed ~0.4 (fathead and shad at 0.37–0.43 of an esocid's length, Wahl & Stein 1988), spiny 0.3 to an
// esocid (pike ambush 0.36 at ~0.30, Turesson & Brönmark 2004), 0.12 to a bass (largemouth 0.57–0.83 on bluegill at 0.12, Savino & Stein)
export const PPRM = [[0.4, 0.4, 0.4], [0.3, 0.12, 0.3]];
// a strike's capture success on prey of S3 bs by a predator of kind cls at prey/predator length r (F3.STRIKE2; the young's too, F3.YWIN_CS)
// a piscivore's reaction distance (m) to prey of L cm when it sees prey of F3.RD_LREF cm at R0 m (F3.RD_SIZE): the visual model
// R²·e^(cR) ∝ L², by Newton from its local power law (monotone from below after the first step; held above half its last value)
function rdOf(R0, L) {
  if (!(R0 > 0) || !(L > 0)) return 0;
  const c = F3.RD_C, T = 2 * Math.log(R0) + c * R0 + 2 * Math.log(L / F3.RD_LREF); let R = R0 * Math.pow(L / F3.RD_LREF, 2 / (2 + c * R0));
  for (let k = 0; k < 3; k++) R = Math.max(0.5 * R, R - (2 * Math.log(R) + c * R - T) / (2 / R + c));
  return R;
}
// THE FIRST WINTER's share of a first-winter fish (WINTER0) over dt s at yf: the Shuter ramp, or a species' own measured model (F3.WIN_JE);
// −1 when none applies (not winter, not its first year, a fish born since the winter began, a species without one) — then its starvation
function winterF(key, Lcm, age, yf, dt) {
  if (!WINTER0.ON || !(age < YEAR)) return -1;
  const je = F3.WIN_JE ? WINTER0.JE[key] : null; if (je) { const w = winterDaysJE(yf); return w > 0 && w < age / DAY ? winterStepJE(Lcm * 10, w, dt / DAY, je) : -1; }
  const wk = WINTER0.K[key]; if (!wk) return -1; const w = winterDays(yf); return w > 0 && w < age / DAY ? winterStep(Lcm * 10, w, dt / DAY, wk) : -1;
}
// the young's table: depth classes (F3.YDEPTH — 4, else 1) and a school's class by its bed
const yND = () => (F3.YDEPTH ? 4 : 1), yDC = bed => (!F3.YDEPTH ? 0 : bed < F3.YD_E0 ? 0 : bed < F3.YD_E1 ? 1 : bed < F3.YD_E2 ? 2 : 3);
function csOf(bs, cls, r) { const fz = Math.max(0, 1 - r / bs.ppr0); return F3.SIZE_RENORM ? Math.min(F3.CS_MAX, bs.cs[cls] * fz / (1 - bs.pprM[cls] / bs.ppr0)) : bs.cs[cls] * fz; }
KEYS3.forEach((k, i) => {
  const s = S3[k], sp = SP[k];
  s.key = k; s.i = i; s.sp = sp; s.name = sp.name; s.preyLR = PREY_LR[k] ?? PREY_LR0;
  { const pd = PRED3[k] || PRED3.other; s.aMax = pd.aMax / 3600; s.vHunt = pd.v; s.predCls = pd.cls; s.act = pd.act; s.cs = CS3[k] || [0.3, 0.3, 0.3]; s.ppr0 = PPR0[SPINY3[k] ? 1 : 0]; s.pprM = PPRM[SPINY3[k] ? 1 : 0]; }   // (F3.STRIKE2)
  s.maxAge = sp.maxAge / Y2 * YEAR; s.matMinAge = sp.matMinAge / Y2 * YEAR; s.mateCd = sp.matingCooldown / Y2 * YEAR;
  s.uRoutine = s.cruise / s.sprint;
  s.pisc = !!sp.diet.fish; s.plank = !!sp.diet.plankton; s.sift = !!sp.diet.detritus;
  s.benthic = !!(sp.diet.larva || sp.diet.snail || sp.diet.detritus || sp.diet.insect);
  // crayfish eaters forage on the bed at any size (stage 7c: the crayfish, littoral3.js — big ones no longer take worms and scuds)
  s.cray = !!sp.diet.cray;
  s.gsi = sex => sex === 0 ? sp.gsiF : sex === 1 ? sp.gsiM : (sp.gsiF + sp.gsiM) / 2;   // (a school: half and half)
  s.spawn = SPAWN3[k]; s.guard = sp.nestGuard ? sp.nestGuard / Y2 * YEAR : 0;   // (s: how long a male keeps its nest)
  s.move = MOVE3[k] || {};
  s.mateCue = clamp(F3.MATE_CUE / Math.sqrt(s.brookRes ? s.perM2 : s.perHa / 1e4), 6, 40);   // (the brook's own: by their density in it)
  s.forageR = clamp(F3.FP_HOME * s.home, F3.FP_MIN, F3.FP_MAX);   // (m: its foraging footprint's radius)   // (m: ~1.5 × the species' spacing — the sparse ones search farther)
});
export const speciesIndex = k => S3[k].i;

// ============================================================ the brain ===============================================
// A recurrent MLP (core.js's form: leaky-integrator hidden units with per-unit memory; the hidden units past `active` are
// masked — the evolvable brain size) with the 3-D input layout below and six outputs. Bearings are in the fish's own frame:
// "right"/"ahead" = sin/cos of the target's horizontal bearing from the heading, "above" = how far above (+) or below (−).
export const IN3 = ['food right', 'food ahead', 'food above', 'food near', 'threat right', 'threat ahead', 'threat above', 'threat near',
  'school right', 'school ahead', 'school density', 'depth', 'over bed', 'bottom depth', 'shore near', 'deeper right', 'deeper ahead',
  'light', 'temperature', 'oxygen', 'energy', 'hunger', 'fear', 'home right', 'home ahead', 'home far'];
export const OUT3 = ['turn', 'pitch', 'thrust', 'strike', 'flee', 'hide'];
const NI = IN3.length, NO = OUT3.length;
export const HID3 = 10;
export const genomeLen3 = (hid = HID3) => hid * NI + hid + NO * hid + NO + hid;
export function randomGenome3(hid = HID3) {
  const n = genomeLen3(hid), g = new Float32Array(n);
  for (let i = 0; i < n; i++) g[i] = rand(-0.8, 0.8);
  const B2 = hid * NI + hid + NO * hid;
  for (let k = 3; k < NO; k++) g[B2 + k] = rand(-2.6, -0.9);   // the actions (strike, flee, hide) start ~off
  for (let j = n - hid; j < n; j++) g[j] = rand(-3, -0.5);     // little memory to start (selection can raise it)
  return g;
}
// (leak: the units' memory, sigmoid of the genome's LEAK block — fixed for a genome, so computed once: leak3)
export function leak3(g, hid = HID3) { const LK = hid * NI + hid + NO * hid + NO, l = new Float32Array(hid); for (let j = 0; j < hid; j++) l[j] = 1 / (1 + Math.exp(-g[LK + j])); return l; }
// (the brain runs the inherited genome g, but its hidden→output weights from lw2 — the fish's PLASTIC copy of that block alone,
// the only weights its learning changes: TRUE_SCALE.md T4, ~1.1 KB an agent saved over a whole copy of the genome)
export const W2OFF3 = HID3 * NI + HID3, NW2_3 = NO * HID3;
export const plastic3 = g => g.slice(W2OFF3, W2OFF3 + NW2_3);   // (a fresh plastic copy: the genome's own block)
export function forward3(g, lw2, inp, h, o, hid, active, leak) {
  const W2 = hid * NI + hid, B2 = W2 + NO * hid;
  for (let j = 0; j < hid; j++) {
    if (j >= active) { h[j] = 0; continue; }
    let s = g[hid * NI + j]; const b = j * NI;
    for (let i = 0; i < NI; i++) s += g[b + i] * inp[i];
    h[j] = leak[j] * h[j] + (1 - leak[j]) * Math.tanh(s);
  }
  for (let k = 0; k < NO; k++) {
    let s = g[B2 + k]; const b = k * hid;
    for (let j = 0; j < active; j++) s += lw2[b + j] * h[j];
    o[k] = k < 2 ? Math.tanh(s) : 1 / (1 + Math.exp(-s));
  }
}
// lifetime learning (core.js reinforce, six outputs): reward-modulated Hebbian change of the hidden→output weights in the
// plastic copy lw, pulled back toward the inherited g — Baldwinian (g is never written)
const _post = new Float32Array(NO);
export function reinforce3(lw2, g, hid, h, o, reward, dt) {   // (lw2: the plastic hidden→output block; g's own block is what it relaxes to)
  const W2 = hid * NI + hid, dec = expm(F3.LEARN_DECAY * dt), R = LEARN.RATE * reward, C = LEARN.CLAMP;
  _post[0] = o[0]; _post[1] = o[1]; for (let k = 2; k < NO; k++) _post[k] = o[k] * 2 - 1;
  for (let k = 0; k < NO; k++) {
    const pk = _post[k], b = k * hid, bg = W2 + k * hid;
    for (let j = 0; j < hid; j++) {
      const i = b + j; let w = lw2[i] + dec * (g[bg + j] - lw2[i]);
      if (R > 0) w += R * h[j] * pk;
      lw2[i] = w < -C ? -C : w > C ? C : w;
    }
  }
}

// ============================================================ helpers =================================================
const lethalO2 = (l25, floor, T) => Math.max(l25 * Math.exp(BIOE.O2_LETHAL_T * (T - 25)), floor);
const engaged = x => x > ACTION.ENGAGE ? (x - ACTION.ENGAGE) / (1 - ACTION.ENGAGE) : 0;
const coldPerf = (T, tOpt, floor) => { const f = Math.max(floor || 0, ENV.COLD_PERF_MIN); return T >= tOpt ? 1 : clamp(f + (1 - f) * (T - 2) / Math.max(1, tOpt - 2), f, 1); };
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const vbLength = (vb, yrs) => vb.Linf * (1 - Math.exp(-vb.k * (yrs - vb.t0)));
const vbAge = (vb, L) => vb.t0 - Math.log(1 - Math.min(0.98, L / vb.Linf)) / vb.k;
// SIGHT by the light at the fish's depth (lux): each species' reaction distance saturates with the light, RD = RD_max·I/(I + K_I)
// (research realtime_foraging.md §1.2, §9.1) — K_I lux: yellow perch feed down to 2–5 lx (larvae's RD = 4.3·I/(0.1 + I) cm,
// Richmond et al. 2004), bluegill 10 lx, pumpkinseed 25 lx; largemouth catch > 95 % of prey down to moonlight (3×10⁻³ lx) — the
// smallmouth likewise; white perch feed at dusk and night (and the 2-D sim's golden shiners in the hour after sunset); the esocids by day and
// twilight; bullheads and suckers mostly by taste and touch (their nonVis). The fish's sight then sets its senses' range and
// its visual feeding: the day's feeding follows the hour's light (the old sight followed the day's noon light all day)
const K_I = { sunfish: 5, perch: 1, sucker: 2, catfish: 5, whiteperch: 0.5, bass: 0.003, pike: 0.5, redbreast: 5, fallfish: 1, killifish: 0.5, dace: 1, alewife: 0.5 };   // (the alewife: particulate by day, filtering in the dark [inf]; the four new: their nearest — sunfish, a visual drift-feeding minnow, a topminnow; prior)
const sight = (lux, kI) => lux / (lux + kI);
const WF = [0, 0];

// one fish, or one school of n fish (every field set here, so every fish has the same shape)
class Fish {
  constructor() {
    this.id = 0; this.k = 0; this.s = null; this.alive = true; this.n = 1; this.school = false; this.cause = '';
    this.x = 0; this.y = 0; this.z = 0; this.yaw = 0; this.pitch = 0; this.spd = 0; this.hx = 0; this.hy = 0;
    this.L = 0; this.W = 0; this.K = 1; this.sex = 0; this.mature = false; this.Lmat = 0; this.gon = 0; this.lastSpawn = -1e18; this.gut = 0; this.gutE = 0;
    this.age = 0; this.gen = 0; this.hue = 0; this.mateCd = 0;
    this.hunger = 1; this.fear = 0; this.energy = 1; this.uAvg = 0.1; this.xo = 1; this.xt = 15; this.rO2 = 0;
    this.eaten = 0; this.cons = 0; this.consMax = 0; this.thrust = 0; this.yawRate = 0; this.pitchT = 0; this.missCd = 0;
    // heritable traits (from the genes) and the brain
    this.genes = null; this.g = null; this.lw = null; this.h = null; this.leak = null; this._dh = null; this._ate = false; this.tAvg = 0; this.esc = 0; this._far = false; this.o = new Float32Array(NO); this.active = HID3;
    this.spdGene = 1; this.turnMax0 = 1; this.sense0 = 1; this.bodyMul = 1; this.tempTol = 8; this.o2Crit = 0.3; this.o2Lethal = 0.1;
    this.o2Ice = 0; this.uilt = 30; this.metabMul = 1;
    this.gape = 0; this.bdep = 0; this.spdMax = 0; this.turnMax = 0; this.senseR = 0;
    // this step's surroundings (set at the start of the fish's turn)
    this.c = -1; this.j = -1; this.jb = -1; this.bed = 1; this.T = 15; this.o2 = 1; this.vis = 1; this.cover = 0;
    this.visF = 1; this._vx = 0; this._vy = 0; this._need = Infinity; this.surfG = 0;   // (feeding's sight; a coarse block's heading and need; surface insects toward the next rise)
    // targets from the senses
    this.fx = 0; this.fy = 0; this.fz = 0; this.fd = -1; this.fv = 0; this.fk = 0;   // food (fk 0 none, 1 fish, 2 bed, 3 plankton)
    this.prey = null; this.threat = null; this.td = -1; this.ax = 0; this.ay = 0; this.az = 0; this.an = 0;
    // reproduction: ripe (heading for its ground), on a nest (nt s left; the nest nx, ny, nz), last year's nest, a mate in view,
    // its lake (1 Upper, 2 Lower) and home there, a brook-summering pumpkinseed
    this.ripe = false; this.nt = 0; this.nx = 0; this.ny = 0; this.nz = 0; this.nestX = NaN; this.nestY = NaN; this.mate = null;
    this.near = false; this._i = -1; this._t0 = 0; this._due = -1;   // (fidelity by distance: inside the focus; its index in the list, its last step's time, the step its next block is due)
    this._out = false;   // (SHARDS: it swam into another shard's water this step)
    this.spX = NaN; this.spY = NaN; this.spYr = -1;   // a ripe plant spawner's chosen place (F3.SUB_*) and the year it chose it
    this.lake = 1; this.lhx = 0; this.lhy = 0; this.brookie = false; this.brookRun = false; this.runYr = -1; this.inRun = false;   // (runYr: the year a full brook turned it back; inRun: it holds one of the brook's nest sites)
    this.tripEnd = 0; this.tpx = 0; this.tpy = 0; this.inLake = 1;   // a trip into the other lake (until, where); the lake it was last in
    this.aleT = 0; this.aleRes = 0; this.leave = false;   // (E8: an alewife's arrival time and residence, sim s; bound out by the outlet)
    // RENDER-ONLY (render3/fish3view.js interpolates between steps from these; the sim never reads them)
    this._px = 0; this._py = 0; this._pz = 0; this._pyaw = 0; this._ppitch = 0;
  }
}

// one school of young-of-year: n fish of one genome and one body (the 2-D sim's world.fry), brainless
class Yoy {
  constructor() {
    this.id = 0; this.k = 0; this.s = null; this.alive = true; this.n = 0;
    this.x = 0; this.y = 0; this.z = 0; this.tx = 0; this.ty = 0; this.tz = 0; this.bed = 1; this.c = -1; this.j = -1; this.jb = -1;
    this.L = 0; this.W = 0; this.bdep = 0; this.age = 0; this.g = null; this.genes = null; this.gen = 0; this.hue = 0;
    this.tk = 0; this.rO2 = 0; this.p = 0; this.cover = 0; this.guard = 0; this.gref = null; this.nx = 0; this.ny = 0;
    this.hd = 0; this.spotBed = 1;   // its cruise's heading, and the bed's depth at its feeding spot
    this.dev = 2; this.eggT0 = 0; this.eggTm = 0; this.hadGuard = false;   // (E3, EGG3: its development on the bed — 0 → 1 the egg, 1 → 2 the yolk-sac larva, 2 swimming —, the water's
    //   temperature it was laid in, its day's running mean there, and whether a guard ever kept it)
    this.bankG = 0; this.bankJ = 0; this._yb = -1; this._ya = 0;   // (stage Y1: young fish caught for its next tick, g and J; its prey-table bin and available n)
    this.near = false; this._t0 = 0; this._due = -1; this._out = false;   // (fidelity by distance, as the fish's; SHARDS: left its shard's water)
    this._px = 0; this._py = 0; this._pz = 0;   // RENDER-ONLY
  }
}

// blank objects of the two kinds (the GPU engine's hand-back builds the fish and schools born on the GPU: gpu/layout.js materialize)
export const newFish = () => new Fish(), newYoy = () => new Yoy();

// a fish or a young school as plain data and back (SHARDS: handed between workers). The object references — its species, the
// prey, threat, mate or guarding parent it had in view — are dropped or kept by key; its genome, learned weights and brain state
// are copied
const FISH_REF = new Set(['s', 'prey', 'threat', 'mate', 'genes', 'g', 'lw', 'h', 'o', 'leak', '_dh']), YOY_REF = new Set(['s', 'g', 'genes', 'gref']);
function packFish(a) {
  const d = { key: a.s.key, genes: a.genes && Float32Array.from(a.genes), g: a.g && Float32Array.from(a.g), lw: a.lw && Float32Array.from(a.lw), h: a.h && Float32Array.from(a.h),
    o: Float32Array.from(a.o), leak: a.leak && Float32Array.from(a.leak), dh: a._dh ? [a._dh[0], a._dh[1]] : null, v: {} };
  for (const k of Object.keys(a)) if (!FISH_REF.has(k)) d.v[k] = a[k];
  return d;
}
function unpackFish(d) {
  const a = new Fish(); Object.assign(a, d.v); a.s = S3[d.key]; a.genes = d.genes; a.g = d.g; a.lw = d.lw; a.h = d.h; a.o = d.o; a.leak = d.leak; a._dh = d.dh;
  a.prey = a.threat = a.mate = null; a.alive = true; a._out = false; a.near = false; a._due = -1;
  return a;
}
function packYoy(q) { const d = { key: q.s.key, g: q.g, genes: q.genes, v: {} }; for (const k of Object.keys(q)) if (!YOY_REF.has(k)) d.v[k] = q[k]; return d; }
function unpackYoy(d) { const q = new Yoy(); Object.assign(q, d.v); q.s = S3[d.key]; q.g = d.g; q.genes = d.genes; q.gref = null; q.guard = 0; q.alive = true; q._out = false; q.near = false; q._due = -1; return q; }

// the share of a coarse block a fish spends within r of the bed, its heights gamma-distributed (shape 2) about its block height h
const reachShare = (r, h) => { const x = 2 * r / Math.max(0.02, h); return 1 - Math.exp(-x) * (1 + x); };
// a guard's stage: 0 over its eggs and the fry to swim-up (its first GUARD_EARLY days), 1 over the free-swimming fry
const guardStage = a => a.s.guard - a.nt < BROOD.GUARD_EARLY * DAY3 ? 0 : 1;
// a tally tree's counts zeroed (its times of first events kept)
const zeroTally = o => { for (const k of Object.keys(o)) { if (typeof o[k] === 'number') { if (k !== 'first') o[k] = 0; } else if (o[k] && typeof o[k] === 'object') zeroTally(o[k]); } };

// ONE SHAPE FOR GOOD (V8): a number field first written as an integer is held as a small integer, and the first fraction later
// written to it re-shapes EVERY object of the class — at true scale ~1 s for the 300,000 fish, each time some field first takes a
// fraction (the year's first nest, the first missed strike…). So each number field that can hold a fraction is made one here, on a
// template kept for good, before any real fish exists; integer fields stay integers. (Exported so that it IS kept: V8 holds a shape
// only while some object has it, and an unexported const nothing reads dies once the module has run — its shapes with it)
const INT_FIELDS = new Set(['id', 'k', 'sex', 'gen', 'active', 'c', 'j', 'jb', 'fk', 'spYr', 'lake', 'inLake', '_i', '_due', 'runYr']);
export const SHAPES = [Fish, Yoy].map(C => { const t = new C(); for (const key of Object.keys(t)) if (typeof t[key] === 'number' && !INT_FIELDS.has(key)) t[key] = 0.5; return t; });

// ============================================================ the fish ===============================================
export class Fish3 {
  constructor(env, { founders = true, young = false, budget = founders } = {}) {   // (young: the season's young so far — seedSeason; the view's lake. budget: F3.AGENTS_HA — off in a hand-built lake, where it would give every fish a brain)
    this.env = env; this.chem = env.chem; this.G = env.G;
    this.fish = []; this.nextId = 1; this.stepNo = 0; this.time = 0;
    this.rises = [];    // this step's RISES — insects taken at the surface (for the renderer): [x, y, length cm, species, id, count]
    this.events = [];   // this step's strikes (for the renderer): [x, y, z, predator id]
    this.stats = { wild: {}, died: {}, eatenBy: {}, food: { zoo: 0, benth: 0, weed: 0, cray: 0, surf: 0, fish: 0, sed: 0, yoy: 0, yZoo: 0, yBenth: 0, yWeed: 0, ySed: 0, yYoy: 0 }, crayBy: {}, intakeBy: {}, kills: 0, eggs: {}, spawns: {}, fry: {}, recruits: {}, eggs3: {} };
    this.stats.ale = { run: 0, arrived: 0, left: 0, spent: 0, yOut: 0, yCold: 0, pIn: 0, nIn: 0, pOut: 0, nOut: 0 };   // (E8: the alewives' run, deaths, emigrants; their N and P in and out, g)
    this.stats.spawnAt = {};
    this.stats.cross = {}; this.stats.settle = {}; this.stats.trips = {}; this.stats.solo = {};
    for (const k of KEYS3) { this.stats.cross[k] = 0; this.stats.settle[k] = 0; this.stats.trips[k] = 0; this.stats.solo[k] = 0; }
    for (const k of KEYS3) { this.stats.eggs[k] = 0; this.stats.spawns[k] = 0; this.stats.recruits[k] = 0; this.stats.spawnAt[k] = { first: -1, bed: 0, brook: 0, sub: 0 }; this.stats.fry[k] = { hatched: 0, natural: 0, starve: 0, heat: 0, hypoxia: 0, eaten: 0, recruited: 0, capped: 0 }; this.stats.eggs3[k] = { laid: 0, swum: 0, base: 0, temp: 0, guard: 0, pred: 0, o2: 0, storm: 0 }; }   // (capped: past the census's room at recruitment, _recruit)
    this.yoy = [];      // the young-of-year schools (Yoy)
    this.soloL = Infinity; this._soloAt = budget ? 0 : Infinity;   // the length from which a schooling species' fish has a brain of its own (F3.AGENTS_HA); when last set (never: no budget)
    this.cnt = new Float64Array(KEYS3.length);   // fish per species this step (Σ n) — the recruitment cap
    this.runIn = new Float64Array(KEYS3.length); this.brookA = BODIES[2].area;   // ripe runners in the brook (its nest sites: spawn.runK)
    this.shard = null; this.cntOther = null; this.juvOther = null; this.juvOwn = null; this.bio = 0; this._fpOwn = null;   // (SHARDS: setShard)
    this.lakeHa = (BODIES[0].area + BODIES[1].area) / 1e4; this.lakeM2 = this.lakeHa * 1e4;
    this._inp = new Float32Array(NI);
    this._hashInit(); this._colStatics(); this._slopeStatics(); this._siteStatics(); this._siteYr = -1;
    if (founders) { this.found(); if (young) this.seedSeason(0, env.yearFrac()); }
  }

  // ---------- static lookups over the water grid ----------
  _colStatics() {
    const G = this.G;
    // neighbouring columns (from the faces) — where a fish looks for richer water
    const nb = Array.from({ length: G.NC }, () => []);
    for (let f = 0; f < G.NF; f++) { nb[G.fa[f]].push(G.fb[f]); nb[G.fb[f]].push(G.fa[f]); }
    this.nbr = nb.map(a => Int32Array.from(a));
    this.colBed = Array.from({ length: G.NC }, (_, c) => { const l = []; for (let k = 0; k < G.nL[c]; k++) if (G.bedA[G.cell0[c] + k] > 0) l.push(G.cell0[c] + k); return Int32Array.from(l); });
    this._fp = new Map(); this._fpB = new Int32Array(4096); this._fpZ = new Int32Array(4096);
    // … and the next ring beyond them (a fish rates the bed's food over ~2 columns — tens of real metres — each side)
    this.nbr2 = nb.map((a, c) => { const set = new Set(); for (const q of a) for (const r of nb[q]) if (r !== c && !a.includes(r)) set.add(r); return Int32Array.from([...a, ...set]); });
    // the bed cell for each column and layer: the nearest layer of that column whose cell holds some of its bed
    this.bedOf = new Int32Array(G.NC * G.ML).fill(-1);
    this.colBedJ = new Int32Array(G.NC);   // a column's representative bed cell (its mean depth's)
    // (E1) each column's mean crevice share (GEO.crev over its world cells): the stones a rock dweller weighs where to go
    this.colCrev = new Float32Array(G.NC); { const n = new Float64Array(G.NC); for (let i = 0; i < GEO.N; i++) { const c = G.colOfFine[i]; if (c >= 0 && GEO.body[i] !== LAND) { n[c]++; this.colCrev[c] += GEO.crev[i]; } } for (let c = 0; c < G.NC; c++) if (n[c] > 0) this.colCrev[c] /= n[c]; }
    for (let c = 0; c < G.NC; c++) {
      const j0 = G.cell0[c], n = G.nL[c];
      for (let k = 0; k < G.ML; k++) {
        const kk = Math.min(k, n - 1); let best = -1, bd = 99;
        for (let q = 0; q < n; q++) if (G.bedA[j0 + q] > 0 && Math.abs(q - kk) < bd) { bd = Math.abs(q - kk); best = j0 + q; }
        this.bedOf[c * G.ML + k] = best;
      }
      this.colBedJ[c] = this.bedOf[c * G.ML + Math.min(G.ML - 1, Math.floor(G.depthMean[c] / G.DZ))];
    }
  }
  // THE LAKE'S SHAPE as a fish knows it: the bed's slope smoothed over ~10 m (a basin's flat floor still leads somewhere — the
  // local slope there is noise), per 1.5-m cell: the unit vector toward deeper water (land counts as 0 m)
  _slopeStatics() {
    const { NX, NY, N } = GEO; let d = new Float32Array(N), t = new Float32Array(N);
    for (let i = 0; i < N; i++) d[i] = Math.max(0, GEO.depth[i]);
    const R = Math.max(1, Math.round(45 * GEO.SCALE / GEO.CELL));   // (3 cells of 1.5 m at 1/10, 9 of 5 m true: ~100 m real after three passes)
    for (let pass = 0; pass < 3; pass++) {
      for (let r = 0; r < NY; r++) { let s = 0, n = 0; for (let c = -R; c < NX + R; c++) { if (c + R < NX) { s += d[r * NX + c + R]; n++; } if (c - R - 1 >= 0) { s -= d[r * NX + c - R - 1]; n--; } if (c >= 0 && c < NX) t[r * NX + c] = s / n; } }
      for (let c = 0; c < NX; c++) { let s = 0, n = 0; for (let r = -R; r < NY + R; r++) { if (r + R < NY) { s += t[(r + R) * NX + c]; n++; } if (r - R - 1 >= 0) { s -= t[(r - R - 1) * NX + c]; n--; } if (r >= 0 && r < NY) d[r * NX + c] = s / n; } }
    }
    this.slopeX = new Float32Array(N); this.slopeY = new Float32Array(N);
    for (let r = 1; r < NY - 1; r++) for (let c = 1; c < NX - 1; c++) {
      const i = r * NX + c, gx = d[i + 1] - d[i - 1], gy = d[i + NX] - d[i - NX], g = Math.hypot(gx, gy);
      if (g > 1e-6) { this.slopeX[i] = gx / g; this.slopeY[i] = gy / g; }
    }
  }
  // each pairing species' spawning grounds: `sites` places per lake in water of its spawning depth, ≥ 6 m apart (seeded)
  _siteStatics() {
    this.sites = {};
    for (const k of KEYS3) {
      const sb = S3[k].spawn; if (!sb.sites) continue; const per = this.sites[k] = { [UPPER]: [], [LOWER]: [] }, nS = Math.round(sb.sites * SITES_MUL);
      for (const lake of [UPPER, LOWER]) {
        const cand = []; for (let i = 0; i < GEO.N; i++) if (GEO.body[i] === lake && GEO.depth[i] >= sb.bot[0] && GEO.depth[i] <= sb.bot[1]) cand.push(i);
        for (let t = 0; t < Math.max(200, 20 * nS) && per[lake].length < nS && cand.length; t++) {
          const [x, y] = GEO.cellCentre(cand[(rand() * cand.length) | 0]);
          if (per[lake].every(p => Math.hypot(p[0] - x, p[1] - y) > F3.SITE_SEP)) per[lake].push([x, y]);
        }
      }
    }
    this._siteIndex();
  }
  // the nearest of each species' grounds per MATE_HC cell (when it has many: true scale's hundreds a lake), for _siteNear
  _siteIndex() {
    const RC = F3.MATE_HC, NXg = Math.ceil((GEO.XMAX - GEO.X0) / RC), NYg = Math.ceil((GEO.YMAX - GEO.Y0) / RC);
    this._sGrid = {}; this._sNX = NXg;
    for (const k in this.sites) {
      this._sGrid[k] = {};
      for (const lake of [UPPER, LOWER]) {
        const L = this.sites[k][lake]; if (L.length <= 16) continue;
        const g = this._sGrid[k][lake] = new Int32Array(NXg * NYg);
        for (let gy = 0; gy < NYg; gy++) for (let gx = 0; gx < NXg; gx++) {
          const x = GEO.X0 + (gx + 0.5) * RC, y = GEO.Y0 + (gy + 0.5) * RC; let best = 0, bd = 1e18;
          for (let q = 0; q < L.length; q++) { const d = (L[q][0] - x) ** 2 + (L[q][1] - y) ** 2; if (d < bd) { bd = d; best = q; } }
          g[gy * NXg + gx] = best;
        }
      }
    }
  }
  // the nearest of species k's grounds in a lake to (x, y): every one for a few (exact), the index for many
  _siteNear(k, lake, x, y) {
    const L = this.sites[k][lake]; if (!L.length) return null;
    const g = this._sGrid && this._sGrid[k] && this._sGrid[k][lake];
    if (!g) { let best = null, bd = 1e18; for (const p of L) { const d = (p[0] - x) ** 2 + (p[1] - y) ** 2; if (d < bd) { bd = d; best = p; } } return best; }
    const RC = F3.MATE_HC, gx = clamp(((x - GEO.X0) / RC) | 0, 0, this._sNX - 1), gy = Math.max(0, ((y - GEO.Y0) / RC) | 0);
    return L[g[Math.min(g.length - 1, gy * this._sNX + gx)]];
  }
  // each spring (F3.SITE_YF) a plant spawner's grounds move to the best structure of its spawning depths: per site, the best of
  // F3.SUB_TRIES random places ≥ 6 m from the others (its lake's coves of last year's stems and mats)
  _siteSub() {
    const P = this.env.plants; if (!P) return;
    for (const k of KEYS3) {
      const sb = S3[k].spawn; if (!sb.sites || !sb.sub) continue; const per = this.sites[k];
      for (const lake of [UPPER, LOWER]) {
        const cand = []; for (let i = 0; i < GEO.N; i++) if (GEO.body[i] === lake && GEO.depth[i] >= sb.bot[0] && GEO.depth[i] <= sb.bot[1]) cand.push(i);
        if (!cand.length) continue; const got = [], nS = Math.round(sb.sites * SITES_MUL);
        for (let s = 0; s < nS; s++) {
          let best = null, bs = -1;
          for (let t = 0; t < F3.SUB_TRIES; t++) {
            const [x, y] = GEO.cellCentre(cand[(rand() * cand.length) | 0]); if (got.some(p => Math.hypot(p[0] - x, p[1] - y) <= F3.SITE_SEP)) continue;
            const v = this._subAt(sb.sub, x, y); if (v > bs) { bs = v; best = [x, y]; }
          }
          if (best) got.push(best);
        }
        if (got.length) per[lake] = got;
      }
    }
    this._siteIndex();
  }
  // the spawning-structure index (0–1) at (x, y) for use u; 1 without plants (a lake without its weeds: the old rule)
  _subAt(u, x, y) {   // (the bed cell under (x, y): plants3's index there)
    const P = this.env.plants; if (!P || !u) return 1; const c = this.env.colAt(x, y); if (c < 0) return 0;
    const i = P.idxOf[this.bedCell(c, Math.max(0.05, GEO.depthAt(x, y)))]; return i >= 0 ? P.spawnS[u][i] : 0;
  }
  // a spawning's hatch: × (bare + (1 − bare) × the index) for a plant spawner; the index tallied (stats.spawnAt.sub)
  _hatchMul(s, x, y) { const sb = s.spawn; if (!sb.sub) return 1; const v = this._subAt(sb.sub, x, y); this.stats.spawnAt[s.key].sub += v; return sb.bare + (1 - sb.bare) * v; }
  // a ripe plant spawner without grounds picks its place: the best structure of F3.SUB_TRIES places within SUB_R of it in its
  // lake at its spawning depths, a detour costing SUB_DETOUR × d / SUB_R of an index
  _pickSpot(a) {
    const sb = a.s.spawn, R = F3.SUB_R; let best = -1e9;
    for (let t = 0; t < F3.SUB_TRIES; t++) {
      const x = a.x + rand(-R, R), y = a.y + rand(-R, R); if (GEO.bodyAt(x, y) !== a.lake) continue;
      const bed = GEO.depthAt(x, y); if (bed < sb.bot[0] || bed > sb.bot[1] || this.env.colAt(x, y) < 0) continue;
      const v = this._subAt(sb.sub, x, y) - F3.SUB_DETOUR * Math.hypot(x - a.x, y - a.y) / R; if (v > best) { best = v; a.spX = x; a.spY = y; }
    }
    if (best === -1e9) { a.spX = a.x; a.spY = a.y; }   // (none in reach: where it is)
  }
  deeper(x, y, out) { const i = cellIndex(x, y); out[0] = i < 0 ? 0 : this.slopeX[i]; out[1] = i < 0 ? 0 : this.slopeY[i]; return out; }
  // the columns within R of column c's centre (cached per radius)
  _footprint(R, c) {
    let t = this._fp.get(R); if (!t) { t = new Array(this.G.NC); this._fp.set(R, t); }
    if (t[c]) return t[c];
    const G = this.G, x = G.cx[c], y = G.cy[c], l = [c];
    for (let q = 0; q < G.NC; q++) if (q !== c && (G.cx[q] - x) ** 2 + (G.cy[q] - y) ** 2 <= R * R && (!this._fpOwn || this._fpOwn(q))) l.push(q);   // (a shard's: its own columns)
    return (t[c] = Int32Array.from(l));
  }
  // the best-oxygenated column about column c (its two rings of neighbours), if clearly better than c's own (by each column's
  // best layer: under the ice the water just below it or the inflow's plume); -1 if none
  _o2Better(c) {
    if (this._o2cAt !== this.stepNo) {   // (each column's best O₂, once a step when some fish needs it)
      const G = this.G, o = this.chem.o2, oc = this._o2c || (this._o2c = new Float32Array(G.NC));
      for (let q = 0; q < G.NC; q++) { let m = 0; for (let k = 0, j = G.cell0[q]; k < G.nL[q]; k++, j++) if (o[j] > m) m = o[j]; oc[q] = m; }
      this._o2cAt = this.stepNo;
    }
    if (c < 0) return -1;
    const oc = this._o2c, nb = this.nbr2[c]; let best = oc[c] * 1.1 + 0.02, bc = -1;
    for (let k = 0; k < nb.length; k++) if (oc[nb[k]] > best) { best = oc[nb[k]]; bc = nb[k]; }
    return bc;
  }
  bedCell(c, bed) { return c < 0 ? -1 : this.bedOf[c * this.G.ML + Math.min(this.G.ML - 1, Math.max(0, Math.floor(bed / this.G.DZ)))]; }

  // ---------- the neighbour hash (positions frozen for the step) ----------
  _hashInit() {
    this.HX = Math.ceil((GEO.XMAX - GEO.X0) / F3.HC); this.HY = Math.ceil((GEO.YMAX - GEO.Y0) / F3.HC);
    this.GHX = this.HX; this.GHY = this.HY; this.hX0 = GEO.X0; this.hY0 = GEO.Y0;   // (the lakes' grid; HX, HY, hX0, hY0, hStart, hItems are the hash in use: the lakes' or the focus's)
    const NH = this.HX * this.HY; this.hStart = new Int32Array(NH + 1); this.hCur = new Int32Array(NH); this.hItems = new Int32Array(256); this.hCell = new Int32Array(256);
  }
  _posAt(a, i) { if (i >= 0 && i < this._hashN) { const P = this.P, o = 4 * i; P[o] = a.x; P[o + 1] = a.y; P[o + 2] = a.z; } }   // (fish i moved: its entry in P)
  _hc(x, y) { const gx = clamp(((x - GEO.X0) / F3.HC) | 0, 0, this.GHX - 1), gy = clamp(((y - GEO.Y0) / F3.HC) | 0, 0, this.GHY - 1); return gy * this.GHX + gx; }   // (the lakes' grid)
  // (tally: the step's counts by species and the lakes' fish biomass too, in the same pass over the fish)
  _hashBuild(tally = false) {
    const f = this.fish, n = f.length, NH = this.GHX * this.GHY;
    if (this._gh) this._useHash(this._gh);
    if (this.hItems.length < n) { this.hItems = new Int32Array(n * 2); this.hCell = new Int32Array(n * 2); }
    const S = this.hStart; S.fill(0); this._hashN = n;
    // (and P: every fish's x, y, z by index, four to a fish — the senses' scan reads these contiguous numbers, not 300,000 scattered
    // fish; each fish's own step keeps its entry current — _live, _posAt — so P holds exactly where each fish is now)
    if (!this.P || this.P.length < 4 * n) this.P = new Float64Array(8 * n + 1024);
    const P = this.P, cnt = this.cnt, runIn = this.runIn; let bio = 0; if (tally) { cnt.fill(0); runIn.fill(0); }
    for (let i = 0; i < n; i++) {
      const a = f[i], o = 4 * i, c = this._hc(a.x, a.y); this.hCell[i] = c; S[c + 1]++; P[o] = a.x; P[o + 1] = a.y; P[o + 2] = a.z;
      if (tally && a.alive) { cnt[a.k] += a.n; bio += a.n * a.W; if (a.inRun && a.ripe) runIn[a.k] += a.n; }   // (the run's admitted fish, in the brook or on their way in from its mouth)
    }
    if (tally) { for (const q of this.yoy) if (q.alive) bio += q.n * q.W; this.bio = bio; if (!this.shard) this.chem.fishKgHa = bio / 1000 / this.lakeHa; }   // (SHARDS: the set sums the shards' bio)   // (the zooplankton's kairomone level: diel vertical migration)
    for (let c = 0; c < NH; c++) S[c + 1] += S[c];
    this.hCur.set(S.subarray(0, NH));
    for (let i = 0; i < n; i++) this.hItems[this.hCur[this.hCell[i]]++] = i;
    this._gh = { S: this.hStart, I: this.hItems, HX: this.GHX, HY: this.GHY, X0: GEO.X0, Y0: GEO.Y0 };
    // the RIPE fish by species in MATE_HC cells (positions as the hash's, the step's start): _findMate's candidates; a fish that
    // ripens during the step joins (_ripeAdd)
    const RM = this._ripeM || (this._ripeM = new Map()); for (const l of RM.values()) l.length = 0;
    for (let i = 0; i < n; i++) if (f[i].alive && f[i].ripe) this._ripeAdd(i);
  }
  // (MATE_HC cells: column gx, row gy of the grid from GEO's origin; a key per species and cell)
  _ripeKey(k, gx, gy) { const NXr = Math.ceil((GEO.XMAX - GEO.X0) / F3.MATE_HC) + 1, NYr = Math.ceil((GEO.YMAX - GEO.Y0) / F3.MATE_HC) + 1; return (k * NYr + gy) * NXr + gx; }
  _ripeAdd(i) {
    const c = this.hCell[i], x = GEO.X0 + ((c % this.GHX) + 0.5) * F3.HC, y = GEO.Y0 + (Math.floor(c / this.GHX) + 0.5) * F3.HC;   // (its hash cell's place in the lakes' hash: its last build)
    const key = this._ripeKey(this.fish[i].k, Math.max(0, ((x - GEO.X0) / F3.MATE_HC) | 0), Math.max(0, ((y - GEO.Y0) / F3.MATE_HC) | 0)), RM = this._ripeM;
    let l = RM.get(key); if (!l) RM.set(key, l = []); l.push(i);
  }

  // ---------- creating fish ----------
  // a fish (n = 1) or a school (n > 1) of species k at (x, y) (z from its habitat when null), `yrs` old
  add(k, x, y, z = null, yrs = 1, n = 1, genome = null, genes = null, Lmul = 1) {
    const s = S3[k], sp = s.sp, a = new Fish();
    a.id = this.nextId++; a.k = s.i; a.s = s; a.n = n; a.school = n > 1;   // (a school, or a group of a solitary species' young; one fish: its own brain)
    a.x = x; a.y = y; a.hx = x; a.hy = y; a.yaw = rand(0, Math.PI * 2);
    a.age = yrs * YEAR; a.sex = a.school ? 2 : rand() < 0.5 ? 0 : 1;
    a.genes = genes || randomGenes(); a.g = genome || randomGenome3(); a.lw = plastic3(a.g); a.h = new Float32Array(HID3); a.leak = leak3(a.g);
    this._traits(a);
    a.L = clamp(vbLength(sp.vb, yrs) * Lmul, sp.Lhatch, sp.vb.Linf); a.K = rand(BIOE.K_START[0], BIOE.K_START[1]); a.W = a.K * stdWeight(sp.lw, a.L);
    a.mature = this._matureAt(a);
    a.mateCd = rand(0, s.mateCd);
    const b0 = GEO.bodyAt(x, y); a.lake = b0 === LOWER ? LOWER : b0 === UPPER ? UPPER : nearestBP(x, y) <= BLAST / 2 ? UPPER : LOWER;
    if (b0 === a.lake) { a.lhx = x; a.lhy = y; } else { [a.lhx, a.lhy] = LAKE_NEAR[a.lake]; a.hx = a.lhx; a.hy = a.lhy; }
    // the brook's users live within reach of it (a fish swims at real speed through a compressed calendar: ~1 m/s is a long
    // trip): pumpkinseed within BROOK_NEAR of their lake's end of the brook summer in its pools (a share of them); suckers
    // within BROOK_RUN run up it to spawn — the rest spawn on the lake's shoals, as lake-spawning suckers do
    const dB = Math.hypot(...(a.lake === UPPER ? BP[0] : BP[BLAST]).map((v, q) => v - (q ? a.lhy : a.lhx)));
    a.brookie = !!s.spawn.brook && dB < F3.BROOK_NEAR && rand() < s.spawn.brook;
    a.brookRun = s.spawn.site === 'brook' && (s.brookRes || dB < F3.BROOK_RUN);
    if (s.brookRes) { const p = b0 === BROOK ? [x, y] : BP[nearestBP(x, y)]; a.lhx = a.hx = p[0]; a.lhy = a.hy = p[1]; }   // (the brook's own: home is its stretch of the brook)
    a.inLake = a.lake;
    a.hue = rand(0, 1);
    this._settle(a);
    a.bed = Math.max(0.05, GEO.depthAt(x, y)); a.z = z === null ? this._zTarget(a, s.hab.day) : z;
    a.z = clamp(a.z, F3.ZTOP, Math.max(F3.ZTOP, a.bed - F3.ZBOT));
    a.spd = s.cruise * a.L / 100; a.uAvg = s.uRoutine;
    a._px = a.x; a._py = a.y; a._pz = a.z; a._pyaw = a.yaw; a._ppitch = 0;
    this.fish.push(a);
    if (this._mixOn) { a._i = this.fish.length - 1; a.near = false; a._t0 = this.time; this._sched(a, this._nb); }
    return a;
  }
  _traits(a) {
    const s = a.s, sp = s.sp, [gSize, gSpeed, gTol, gFin, gEye, gBody, gBrain] = a.genes;
    a.active = clamp(Math.round(HID3 * gBrain), Math.min(BRAIN.HID_MIN, HID3), HID3);
    a.turnMax0 = s.turn * (0.6 + 0.4 * gFin); a.sense0 = s.sense * (0.6 + 0.4 * gEye);
    a.spdGene = gSpeed * (1.18 - 0.18 * gBody) * (1.05 - 0.05 * gFin); a.bodyMul = 0.8 + 0.2 * gBody;
    a.tempTol = sp.tempTol * gTol; a.o2Crit = clamp(sp.o2Crit * (2 - gTol), 0.05, 0.9);
    a.o2Lethal = clamp(sp.o2Lethal / ENV.O2_MGL * (2 - gTol), 0.005, 0.5); a.o2Ice = clamp((sp.o2Ice ?? 0) / ENV.O2_MGL * (2 - gTol), 0, 0.5);
    a.uilt = sp.uilt + BIOE.UILT_GENE * (gTol - 1);
    a.metabMul = (0.85 + 0.15 * gSpeed) * (0.9 + 0.1 * gTol) * (0.95 + 0.05 * gFin) * (0.93 + 0.07 * gEye) * (0.92 + 0.08 * gBody) * (1 - BRAIN.COST * (HID3 - a.active) / HID3);
    const lm = sp.Lmat * Math.pow(gSize, BIOE.LMAT_GENE);
    a.Lmat = a.sex === 1 && sp.LmatM ? lm * sp.LmatM / sp.Lmat : a.sex === 2 && sp.LmatM ? lm * (1 + sp.LmatM / sp.Lmat) / 2 : lm;
  }
  _matureAt(a) {
    const s = a.s, lmatAt = Math.max(BIOE.PMRN_FLOOR, 1 - BIOE.PMRN_SLOPE * Math.max(0, (a.age - s.matMinAge) / YEAR));
    return a.age >= s.matMinAge && a.L >= a.Lmat * lmatAt;
  }
  // the size-dependent abilities (speed, turning, senses, gape) and the condition's reserve
  _settle(a) {
    const s = a.s, sp = s.sp, r = a.L / sp.Lref;
    a.spdMax = s.sprint * a.L / 100 * a.spdGene;
    a.turnMax = a.turnMax0 * clamp(Math.pow(r, -0.2), 0.9, 1.5);
    a.senseR = a.sense0 * clamp(Math.pow(r, 0.3), 0.5, 1.15);
    a.gape = a.L * sp.gapeR; a.bdep = a.L * sp.depthR * a.bodyMul;
    a.K = a.W / stdWeight(sp.lw, a.L); a.energy = clamp((a.K - 0.6) / 0.4, 0, 1);
    a.hunger = 1 - clamp(a.gut / (sp.gut * a.W), 0, 1);
  }

  // THE FOUNDERS: each species at the census (fish ≥ minL — 7.5 cm unless set — per hectare of lake; the brook's own per m² of
  // the brook) over its daytime habitat — in its lake when MDIFW records it in one (`only`), weighted toward the brook's ends
  // for a species of flowing water (`nearBrook` m) — ages from its natural mortality (the age at minL + an exponential with
  // mean 1/M years), schools one cohort each
  found() {
    const yf0 = this.env.yearFrac();
    for (const k of KEYS3) {
      const s = S3[k], sp = s.sp, [lo, hi] = s.hab.day.bot;
      const target = Math.round(this._target(s));
      const ok = b => s.brookRes ? b === BROOK : s.only ? b === s.only : b === UPPER || b === LOWER;
      const cand = []; for (let i = 0; i < GEO.N; i++) if (ok(GEO.body[i]) && GEO.depth[i] >= lo && GEO.depth[i] <= hi) cand.push(i);
      if (s.nearBrook) {   // (each cell kept with the chance 0.08 + e^(−d/nearBrook), d its distance to the nearer end of the brook)
        const near = cand.filter(i => { const [x, y] = GEO.cellCentre(i), d = Math.min(Math.hypot(x - BP[0][0], y - BP[0][1]), Math.hypot(x - BP[BLAST][0], y - BP[BLAST][1])); return rand() < 0.08 + Math.exp(-d / s.nearBrook); });
        if (near.length) cand.splice(0, cand.length, ...near);
      }
      const a0 = Math.max(0.5, vbAge(sp.vb, (s.minL || 7.5) / (s.found || 1))), maxY = sp.maxAge / Y2;
      let made = 0;
      while (made < target && cand.length) {
        let yrs = 0; for (let t = 0; t < 16; t++) { yrs = a0 - Math.log(1 - rand()) / sp.M; if (yrs < 0.9 * maxY) break; yrs = a0; }
        let n = s.school ? Math.min(target - made, Math.max(4, Math.round(s.school * (0.5 + rand())))) : 1;
        if (s.school && target - made - n < 4) n = target - made;   // (the last few join this school: a "school" of one is no school)
        const i = cand[(rand() * cand.length) | 0], [cx, cy] = GEO.cellCentre(i);
        let x = cx + (rand() - 0.5) * GEO.CELL, y = cy + (rand() - 0.5) * GEO.CELL;
        if (this.env.colAt(x, y) < 0 || !ok(GEO.bodyAt(x, y))) { x = cx; y = cy; }   // (in the water it was founded for — a narrow brook's cell is not all water)
        const a = this.add(k, x, y, null, yrs, n, null, null, s.found || 1);
        // mature fish carry gonads: ripe if this year's spawning is still ahead of the start date, spent if it is past
        if (a.mature) a.gon = s.gsi(a.sex) * a.W * (yf0 < SPAWN.SEASON_END && seasonalTemp(yf0) < sp.spawnT[1] ? 1 : 0.15);
        a.mateCd = 0;   // (founders are out of any cooldown — world.js)
        made += n;
      }
    }
    this._soloCut(); this._schools(); this.fish = this.fish.filter(a => a.alive);   // (who has a brain of its own from the start)
  }
  // a spot within r of (x, y) in the same water — or (x, y) itself (a narrow brook's cell is not all water)
  _near(x, y, r) {
    const b = GEO.bodyAt(x, y), nx = x + (rand() - 0.5) * r, ny = y + (rand() - 0.5) * r;
    return GEO.bodyAt(nx, ny) === b && this.env.colAt(nx, ny) >= 0 && GEO.depthAt(nx, ny) > F3.ZTOP + F3.ZBOT ? [nx, ny] : [x, y];
  }
  // a species' census in fish: per hectare of lake, or the brook's own per m² of the brook
  _target(s) {
    if (!s.brookRes) return s.perHa * this.lakeHa;
    const A = this._brookArea || (this._brookArea = GEO.body.reduce((t, b) => t + (b === BROOK ? GEO.CELL * GEO.CELL : 0), 0));
    return s.perM2 * A;
  }
  // the fish a group of the species holds (its schools, or its young's groups); the length from which its fish has its own brain
  _gSize(s) { return s.school || (s.group ? s.group[1] : 0); }
  _soloOf(s) { return s.solo ? this.soloL : s.group ? s.group[0] : s.school ? Infinity : 0; }
  // THE BUDGET'S CUTOFF (F3.AGENTS_HA): while the lakes' agents are under budget, the schools of the schooling species give their
  // fish brains of their own from the largest down — each school that breaks up adds its fish less one — and the cutoff is the
  // smallest length so reached; with no room (the recruits, the fish already on their own — they keep their brains) no school
  // breaks up until there is (the cutoff past every school: as schools grow, a fixed cutoff would let them all through)
  _soloCut() {
    const B = F3.AGENTS_HA * (this.shard ? this.shard.budgetHa : this.lakeHa); let A = 0;   // (SHARDS: its share of the brains: its water's area)
    for (const a of this.fish) if (a.alive && !a.s.brookRes) A++;
    const sch = this.fish.filter(a => a.alive && a.school && a.s.solo && !a.ripe).sort((p, q) => q.L - p.L);
    let cut = Infinity;
    for (const a of sch) { const more = Math.max(0, Math.floor(a.n) - 1); if (A + more > B) break; A += more; cut = a.L; }
    this.soloL = cut; this._soloAt = this.env.time;
  }
  // a school whose fish have reached their own-brain length breaks up into individuals (the fish conserved: n of them, the first
  // with the school's genome, the rest fresh mutations of it — siblings, as recruits are)
  _dissolve(a) {
    const s = a.s, k = s.key, n = Math.max(1, Math.floor(a.n + rand())), yrs = a.age / YEAR;
    for (let i = 0; i < n; i++) {
      const [x, y] = this._near(a.x, a.y, 0.8), b = this.add(k, x, y, a.z, yrs, 1, i ? mutate(a.g) : a.g, i ? mutateGenes(a.genes) : a.genes);
      b.L = a.L; b.W = a.W; b.gen = a.gen; b.hue = a.hue; b.age = a.age; b.lake = a.lake; b.lhx = a.lhx; b.lhy = a.lhy; b.hx = a.hx; b.hy = a.hy; b.inLake = a.inLake;
      b.gut = a.gut; b.gutE = a.gutE; b.mature = a.mature; b.gon = b.mature ? s.gsi(b.sex) * b.W * clamp(a.gon / Math.max(1e-9, s.gsi(2) * a.W), 0, 1) : 0;
      b.mateCd = a.mateCd; b.lastSpawn = a.lastSpawn; this._traits(b); this._settle(b);
      b.bed = Math.max(0.05, GEO.depthAt(b.x, b.y)); b.z = clamp(a.z, F3.ZTOP, Math.max(F3.ZTOP, b.bed - F3.ZBOT)); b._pz = b.z;
    }
    this.stats.solo[k] += n; a.alive = false; a.cause = 'dissolved'; a.n = 0;
  }

  // THE SEASON'S YOUNG SO FAR. A new lake opens on a date (SEASON.START_YF: mid/late May), past the spawning of the fish that
  // spawn just after ice-out (yellow perch, chain pickerel: 6–12 °C) and into the suckers' and white perch's; a season jump
  // skips weeks. The real lake on that date holds those spawnings' young (the human, 2026-10-16, on a fresh lake: "it's saying
  // there aren't any schools of young fish, is that correct?"). Over [yf0, yf1) each mature fish of a species whose spawning
  // temperatures the season's water (seasonalTemp) passed spawns as _spawn would — with the chance of the share of its
  // spawning that is past (a population spawns over its window's first days: SEED_SPREAD), on a day in it — on its ground
  // (the brook for a brook runner, its species' traditional grounds, else water of its spawning depth near home): its eggs ×
  // hatch, its genome crossed with a mate's, a nest guarded while the guarding lasts. The young are then carried from their day to yf1 by their own equations (_spinYoy) — with the young already in the
  // lake too when `carry` (a season jump). Returns the schools made
  seedSeason(yf0, yf1, carry = false) {
    if (!(yf1 > yf0)) return 0;
    const win = this._spawnWin || (this._spawnWin = this._spawnWindows()), made = carry ? this.yoy.filter(q => q.alive).map(q => [q, yf0]) : [], used = new Set();
    const yr0 = Math.floor(this.env.time / YEAR) * YEAR, spent = b => b.lastSpawn >= yr0, mates = this._mateIndex();   // (spawned already this year: once a year)
    // (the brook's share of a species' runners, by its nest sites: SEED_RUNS sets at once over the season — a run's fish come and go
    // over its ~3 weeks)
    const nRun = new Float64Array(KEYS3.length); for (const b of this.fish) if (b.alive && b.mature && b.brookRun && b.s.spawn.runK) nRun[b.k] += b.n;
    this._seedRunP = KEYS3.map((k, i) => S3[k].spawn.runK ? Math.min(1, F3.SEED_RUNS * S3[k].spawn.runK * this.brookA / Math.max(1, nRun[i])) : 1);
    let nNew = 0;
    for (let i = 0, n0 = this.fish.length; i < n0; i++) {
      const a = this.fish[i]; if (!a.alive || !a.mature || a.sex === 1 || spent(a)) continue;   // (the female, or the school, spawns)
      const s = a.s, sp = s.sp, w = win[a.k]; if (!w) continue;
      if (s.spawnP && ((Math.imul(a.id >>> 0, 2654435761) ^ Math.imul((Math.floor(this.env.time / YEAR) + 7) >>> 0, 40503)) >>> 0) / 4294967296 >= s.spawnP) continue;   // (E3b spawnP: _ripe's own draw — the founding's skipping spawners too)
      const sp1 = w[0] + Math.min(w[1] - w[0], F3.SEED_SPREAD / YEAR), sh = y => clamp((y - w[0]) / (sp1 - w[0]), 0, 1);
      const o0 = Math.max(w[0], yf0), o1 = Math.min(sp1, yf1);
      if (!(o1 > o0) || rand() > (sh(yf1) - sh(yf0)) / (1 - sh(yf0))) continue;
      const b = a.sex === 2 ? a : this._seedMate(a, used, spent, mates); if (!b) continue;
      const yfS = o0 + rand() * (o1 - o0), ago = (yf1 - yfS) * YEAR, [x, y] = this._seedGround(a), nz = Math.max(0.05, GEO.depthAt(x, y) - 0.03);
      const females = a.sex === 2 ? a.n / 2 : 1, eggs = females * sp.fec.a * Math.pow(a.L, sp.fec.b), larvae = eggs * (EGG3.ON ? 1 : sp.sHatch) * this._hatchMul(s, x, y);
      this.stats.eggs[s.key] += eggs; this.stats.spawns[s.key]++; if (EGG3.ON) this.stats.eggs3[s.key].laid += larvae; else this.stats.fry[s.key].hatched += larvae;
      const q = this._mkYoy(a.k, x, y, nz, larvae, mutate(crossover(a.g, b.g)), mutateGenes(crossoverGenes(a.genes, b.genes)), Math.max(a.gen, b.gen) + 1, (a.hue + b.hue) / 2);
      if (s.guard && b !== a && b.n === 1 && ago < s.guard) {   // (still on the nest: the male guards it — he is there)
        b.nt = s.guard - ago; b.nx = x; b.ny = y; b.nz = nz; q.guard = b.id; q.gref = b; q.nx = x; q.ny = y; q.hadGuard = true;
        if (s.spawn.faith) { b.nestX = x; b.nestY = y; }
        b.x = b._px = x; b.y = b._py = y; b.bed = Math.max(0.05, GEO.depthAt(x, y)); b.z = b._pz = clamp(b.z, F3.ZTOP, Math.max(F3.ZTOP, b.bed - F3.ZBOT));
        if (this._mixOn) this._posAt(b, b._i);   // (a focus run's P outlives the step: kept current; otherwise the next step's hash rebuilds it)
      }
      a.gon = 0; a.ripe = false; a.mateCd = Math.max(0, s.mateCd - ago); a.lastSpawn = yr0 + yfS * YEAR;
      if (b !== a) { b.gon = 0; b.ripe = false; b.mateCd = Math.max(0, s.mateCd - ago); b.lastSpawn = a.lastSpawn; }
      made.push([q, yfS]); nNew++;
    }
    this._spinYoy(made, yf1);
    return nNew;
  }
  // each species' spawning window in the season (yf from, to): from when the season's water (seasonalTemp) reaches its
  // spawning temperatures — _spawn's soft edges, SPAWN.EDGE: the sunlit shallows run ahead of the lake — until it passes
  // them (or SPAWN.SEASON_END); null if it never reaches them
  _spawnWindows() {
    return KEYS3.map(k => {
      const lo = S3[k].sp.spawnT[0] - SPAWN.EDGE, hi = S3[k].sp.spawnT[1] + SPAWN.EDGE; let a = -1, b = SPAWN.SEASON_END;
      for (let yf = 0.05; yf < SPAWN.SEASON_END; yf += 0.0005) { const T = seasonalTemp(yf); if (a < 0) { if (T >= lo) a = yf; } else if (T > hi) { b = yf; break; } }
      return a < 0 ? null : [a, b];
    });
  }
  // a seeded spawning's mate: the mature male of its species in its lake living nearest it that hasn't spawned this year (any,
  // if every one has)
  // the nearest-homed unused male of a's species and lake (else the first such male, used or not). (An index of the males by home:
  // the true-size lakes' 300,000 fish made the scan of every fish for every spawning female ~100 s; the same fish are chosen —
  // nearest first, a tie to the earlier in the list)
  _seedMate(a, used, spent, M) {
    const L = M.by.get(a.k * 4 + a.lake); if (!L) return null;
    const CS = M.CS, gx = Math.floor((a.lhx - M.X0) / CS), gy = Math.floor((a.lhy - M.Y0) / CS);
    let best = null, bo = -1, bd = 1e18;
    for (let r = 0; r <= M.RMAX; r++) {
      if (r > 1 && ((r - 1) * CS) ** 2 > bd) break;   // (every cell of ring r lies at least r − 1 cells away)
      for (let q = 0, nq = r ? 8 * r : 1; q < nq; q++) {   // (ring r's cells: its perimeter, side by side)
        const sd = r ? Math.floor(q / (2 * r)) : 0, t = r ? q % (2 * r) : 0;
        const xx = sd === 0 ? gx - r + t : sd === 1 ? gx + r : sd === 2 ? gx + r - t : gx - r, yy = sd === 0 ? gy - r : sd === 1 ? gy - r + t : sd === 2 ? gy + r : gy + r - t;
        const cell = L.cells.get(yy * 65536 + xx); if (!cell) continue;
        for (const o of cell) {
          const b = L.list[o]; if (used.has(b) || spent(b)) continue;
          const d = (b.lhx - a.lhx) ** 2 + (b.lhy - a.lhy) ** 2; if (d < bd || (d === bd && o < bo)) { bd = d; best = b; bo = o; }
        }
      }
    }
    if (best) used.add(best);
    return best || L.list[0];
  }
  _mateIndex() {   // the mature males of each species and lake (in the fish's order), by their homes on CS-m cells
    const CS = 100 * GEO.SCALE, by = new Map();
    for (const b of this.fish) {
      if (!b.alive || b.sex !== 1 || !b.mature) continue;
      const key = b.k * 4 + b.lake; let L = by.get(key); if (!L) by.set(key, L = { list: [], cells: new Map() });
      const o = L.list.length, c = Math.floor((b.lhy - GEO.Y0) / CS) * 65536 + Math.floor((b.lhx - GEO.X0) / CS);
      L.list.push(b); let cell = L.cells.get(c); if (!cell) L.cells.set(c, cell = []); cell.push(o);
    }
    return { by, CS, X0: GEO.X0, Y0: GEO.Y0, RMAX: Math.ceil(Math.max(GEO.XMAX - GEO.X0, GEO.YMAX - GEO.Y0) / CS) + 1 };
  }
  // where a seeded spawning was: a brook runner's riffles, its species' traditional grounds in its lake, else the nearest of a
  // few places of its spawning depth about its home
  _seedGround(a) {
    const s = a.s, sb = s.spawn, st = this.sites[s.key], wet = (x, y) => GEO.bodyAt(x, y) === a.lake && GEO.depthAt(x, y) > 0.12;
    if (a.brookRun && (!sb.runK || rand() < this._seedRunP[a.k])) { const p = BP[1 + ((rand() * (BLAST - 1)) | 0)]; return [p[0], p[1]]; }
    if (st && st[a.lake].length) { const p = st[a.lake][(rand() * st[a.lake].length) | 0], x = p[0] + rand(-1, 1), y = p[1] + rand(-1, 1); return wet(x, y) ? [x, y] : [p[0], p[1]]; }
    if (sb.sub) { const x0 = a.x, y0 = a.y; a.x = a.lhx; a.y = a.lhy; this._pickSpot(a); a.x = x0; a.y = y0; const p = [a.spX, a.spY]; a.spX = a.spY = NaN; if (wet(p[0], p[1])) return p; }
    const bc = this._bandC || (this._bandC = {}), key = s.key + '_' + a.lake;
    const cand = bc[key] || (bc[key] = (() => { const l = []; for (let i = 0; i < GEO.N; i++) if (GEO.body[i] === a.lake && GEO.depth[i] >= sb.bot[0] && GEO.depth[i] <= sb.bot[1]) l.push(i); return l; })());
    if (!cand.length) return [a.x, a.y];
    let best = null, bd = 1e18;
    for (let t = 0; t < 12; t++) { const [x, y] = GEO.cellCentre(cand[(rand() * cand.length) | 0]), d = (x - a.lhx) ** 2 + (y - a.lhy) ** 2; if (d < bd) { bd = d; best = [x, y]; } }
    return best;
  }
  // carry schools of young [school, the yf it starts from] to yf1, a day at a time on the season's temperature: FB4 growth at
  // F3.SEED_P of their Cmax by the season (× the larvae's CMAX_LARVA) on the food of their stage (zooplankton; the bed's past benthL), and
  // _stepYoy's mortality — the larval critical period, the juveniles' density-compensated predation, the species' M — × SEED_M
  _spinYoy(made, yf1) {
    if (!made.length) return;
    const juvD = new Float64Array(KEYS3.length), dY = DAY / YEAR;
    // (L2/E3b) THE FISH'S PREDATION ON THE SEASON'S LARVAE IN THE SPIN, as _yReq's rule would take them from the founders: each larva-picker's
    // clearance × its weight on larvae of the school's length, × FRY.SPIN_SIGHT (the day's mean sight × cold — probe larvdiag: 0.41–0.47 for
    // perch and white perch), over the lakes' water — the prolarvae too (EGG3.PROLARVA); the predators' appetite not binding (it binds above
    // ~160 larvae/m² — fish_predation_on_larvae.md §3.4). Without it the founding's young had no larva-eating fish (seed 612: 75 perch larvae/m²)
    const preds = []; let Vw = 0; if (FRY.LARV2) { for (let j = 0; j < this.G.NCELL; j++) Vw += this.G.vol[j]; for (const a of this.fish) if (a.alive && (a.s.larvO ?? 0) > 0 && !(a.s.pisc && a.L >= a.s.sp.Lpisc && a.L >= 3 * a.s.sp.Lpisc)) preds.push(a); }
    const zFish = L => { if (!preds.length || L > FRY.LARVA_L) return 0; let a0 = 0; for (const a of preds) a0 += a.n * larvVol(a.s, a.L) * larvW(a.s, a.L, L); return a0 * FRY.SPIN_SIGHT / Vw * DAY; };   // (/day)
    for (let yf = Math.min(...made.map(m => m[1])); yf < yf1 - 1e-9; yf += dY) {
      const dd = Math.min(1, (yf1 - yf) / dY), T = seasonalTemp(yf + dY * dd / 2);
      juvD.fill(0); for (const [q, y0] of made) if (q.alive && y0 <= yf) juvD[q.k] += q.n * (1 - Math.exp(-((q.L / FRY.LARVA_L) ** 2))) / this.lakeM2;
      for (const [q, y0] of made) {
        if (!q.alive || y0 > yf) continue;
        if (q.dev < 2) {   // (E3: a clutch laid before the lake opened — its development and its baseline and thermal deaths on the season's water)
          const P = EGG3.sp[q.s.key], egg = q.dev < 1, r = egg ? eggRate3(P, T) : yolkRate3(P, T), hB = -Math.log(egg ? P.hatch : P.yolkHatch ?? EGG3.YOLK_HATCH) * r, hT = EGG3.THERM_K * (Math.max(0, (egg ? P.tl[0] : P.ytl0 ?? P.tl[0]) - T) + Math.max(0, T - P.tl[1]));
          const hP = (egg && P.pred > 0 ? -Math.log(1 - P.pred) * r : 0) + (!egg && EGG3.PROLARVA && !q.gref ? zFish(q.L) : 0), hz = hB + hT + hP;   // (E3b: the eggs' own predators, the prolarvae the fish's — an unguarded brood's)
          const lost = q.n * -Math.expm1(-hz * dd), t = this.stats.eggs3[q.s.key]; if (lost > 0) { t.base += lost * hB / hz; t.temp += lost * hT / hz; t.pred += lost * hP / hz; q.n -= lost; }
          q.dev += r * dd; q.age += dd * DAY; if (q.dev >= 2) { q.dev = 2; this.stats.fry[q.s.key].hatched += q.n; t.swum += q.n; }
          continue;
        }
        const sp = q.s.sp, b = sp.bioJuv || sp.bio, d = sp.diet;
        const pS = F3.SEED_P[0] + (F3.SEED_P[1] - F3.SEED_P[0]) * clamp((yf - F3.SEED_P_YF[0]) / (F3.SEED_P_YF[1] - F3.SEED_P_YF[0]), 0, 1);
        const C = pS * coldCmax(sp.cold, b, sp.bio, q.W, T) * q.W * dd * (1 + ((q.s.cmaxL ?? FRY.CMAX_LARVA) - 1) * clamp((FRY.LARVA_CM[1] - q.L) / (FRY.LARVA_CM[1] - FRY.LARVA_CM[0]), 0, 1));
        const J = C * (q.L >= (sp.benthL ?? FRY.BENTH_L) && (d.larva || d.snail || d.detritus) ? PREY.BENTH_ED : PREY.DAPH_ED);
        wasteFractions(b, T, pS, WF);
        const Wr = F3.RWMIN_STEEP && !(b.RB < -0.3) ? q.W : Math.max(q.W, FRY.R_WMIN), Rj = coldResp(sp.cold, b, sp.bio, Wr, T) * q.W * OXYCAL * dd;   // (F3.RWMIN_STEEP)
        const Fe = WF[0] * J, U = WF[1] * (J - Fe), net = J - Fe - U - b.SDA * (J - Fe) - Rj;
        if (net > 0) { q.W += net / energyDensity(b, q.W); if (q.W > stdWeight(sp.lw, q.L)) { q.L = lengthFor(sp.lw, q.W); q.bdep = q.L * sp.depthR; } }
        const lf = Math.exp(-((q.L / FRY.LARVA_L) ** 2));
        const hN = (FRY.M_LARVA3 / Math.max(0.3, q.L) * lf + FRY.M_JUV3 * (1 - lf) * (juvD[q.k] + FRY.JUV_D50) / (FRY.JUV_DREF + FRY.JUV_D50) * Math.min(FRY.M_JUV_CLAMP[1], Math.max(FRY.M_JUV_CLAMP[0], Math.pow(q.L / FRY.M_JUV_L, -FRY.M_JUV_B)))) * Math.min(1, Math.pow(FRY.M_JUV_Q10, (T - 20) / 10))
          + sp.M * BIOE.M_OTHER * Math.min(F3.YM_CAP, Math.pow(q.L / sp.Lref, -0.87)) * (F3.YM_COLD ? Math.min(1, Math.pow(FRY.M_JUV_Q10, (T - 20) / 10)) : 1) * DAY / YEAR;   // (/day; F3.YM_COLD, YM_CAP as _yoyLive)
        const hE = zFish(q.L), hz = hN * F3.SEED_M + hE, lost = q.n * -Math.expm1(-hz * dd);   // (L2: the larva-pickers' share — zFish)
        this.stats.fry[q.s.key].natural += lost * (1 - hE / hz); this.stats.fry[q.s.key].eaten += lost * hE / hz; q.n -= lost; q.age += dd * DAY; q.p = pS;
        if (q.n < 1) q.alive = false;
      }
    }
    this.yoy = this.yoy.filter(q => q.alive);
  }

  // ---------- where a fish wants to be ----------
  // the habitat mode now: day ↔ night by the sun, → winter in cold water
  _mode(a) {
    const s = a.s, H = s.hab, e = this.env, nf = 1 - smooth(0.02, 0.3, e.sun), wf = clamp((9 - a.T) / 4, 0, 1);
    const m = this._m || (this._m = { bot: [0, 0], v: 0, h: 0, act: 0, s0: 0, s1: 0 }); m.s0 = 0; m.s1 = 0;   // (s0/s1: its shore band, S3 shore — 0: none)
    if (a.nt > 0) { m.bot[0] = 0; m.bot[1] = 99; m.v = 0; m.h = 0.05; m.act = BROOD.HOVER; return m; }   // on its nest
    if (a.ripe) { const sb = s.spawn; m.bot[0] = sb.bot[0]; m.bot[1] = sb.bot[1]; m.v = 0; m.h = sb.h; m.act = 0.9; return m; }   // to its spawning ground
    if (a.brookie && this._brookSeason(a) && GEO.bodyAt(a.x, a.y) === BROOK) { m.bot[0] = a.L >= F3.RIFFLE_L ? F3.RIFFLE_D : 0.2; m.bot[1] = 1.3; m.v = 0; m.h = 0.25; m.act = 0.6; return m; }   // in the brook's pools (bigger-deeper)
    const blend = (p, q, t) => p + (q - p) * t, J = s.habJ, jf = J ? 1 - clamp((a.L - J.L[0]) / (J.L[1] - J.L[0]), 0, 1) : 0;   // (jf: how young — its day band's share of the juveniles')
    const dlo = blend(H.day.bot[0], J ? J.bot[0] : 0, jf), dhi = blend(H.day.bot[1], J ? J.bot[1] : 0, jf);
    const lo = blend(dlo, H.night.bot[0], nf), hi = blend(dhi, H.night.bot[1], nf);
    const wlo = J && J.wbot ? blend(H.winter.bot[0], J.wbot[0], jf) : H.winter.bot[0], whi = J && J.wbot ? blend(H.winter.bot[1], J.wbot[1], jf) : H.winter.bot[1];   // (the young's winter water)
    m.bot[0] = blend(lo, wlo, wf); m.bot[1] = blend(hi, whi, wf);
    const md = wf > 0.5 ? H.winter : nf < 0.5 ? H.day : H.night;   // (its place in the column: blended when day and night agree on the kind)
    m.v = md.v; m.h = md !== H.winter && H.day.v === H.night.v ? blend(H.day.h, H.night.h, nf) : md.h;
    m.act = blend(blend(H.day.act, H.night.act, nf), H.winter.act, wf);
    if (F3.BAND_LAKE > 0) { const b = GEO.bodyAt(a.x, a.y); if (b === UPPER || b === LOWER) { const zL = BODIES[b - 1].max - F3.BAND_LAKE; if (m.bot[0] > zL) { m.bot[0] = zL; m.bot[1] = Math.max(m.bot[1], zL); } } }   // (F3.BAND_LAKE: within its own lake's depth)
    if (a.L >= F3.RIFFLE_L && GEO.bodyAt(a.x, a.y) === BROOK) { m.bot[0] = Math.max(m.bot[0], F3.RIFFLE_D); m.bot[1] = Math.max(m.bot[1], m.bot[0]); }   // (bigger-deeper: the brook's pools)
    // ITS SHORE BAND (S3 shore, real metres × the world's scale): pulled back toward shore beyond s0, fully from s1 — day and night
    // blended by the light, widened toward the twilight values at dusk and dawn; none in winter
    const sh = s.shore; if (sh && wf < 0.5) { const tw = 1 - Math.abs(2 * nf - 1); m.s0 = GEO.SCALE * blend(blend(sh.day[0], sh.night[0], nf), sh.tw[0], tw); m.s1 = GEO.SCALE * blend(blend(sh.day[1], sh.night[1], nf), sh.tw[1], tw); }
    return m;
  }
  _zTarget(a, m) {
    const bed = a.bed;
    return m.v === 0 ? bed - m.h - a.L / 200 : m.v === 1 ? bed * m.h : Math.min(m.h, bed * 0.8);
  }

  // ============================================================ step ===================================================
  // ONE STEP covers dt real seconds of the fish's lives (physiology, feeding, hazards, ageing) and mv seconds of their
  // swimming (senses, brains, drives, movement). At the fine rung the two are one (mv = dt); stage R2's compat rung runs the
  // 1-hour year's (dt 876 s with 0.1 s of swimming) until R3 gives the coarse rungs their own movement
  step(dt, mv) {
    const coarse = this._coarse = mv === undefined && dt > F3.FINE_MAX; if (mv === undefined) mv = dt;   // (mv given: the R2 compat rung)
    const e = this.env, ch = this.chem, f = this.fish, fo = this.focus, mixed = !!fo && !coarse;
    this.time += dt; this.stepNo++; this.events.length = 0; this.rises.length = 0;
    // (with a focus the whole lakes' hash, counts and biomass come once a simulated second, HASH_EVERY steps — its far fish live in
    // blocks — and the focus has its own hash every step: _stepMixed)
    const full = !mixed || !this._mixOn || this._needHash || this.stepNo % F3.HASH_EVERY === 0;
    if (full) {
      this._needHash = false; this._hashBuild(true);   // (and the counts by species, the lakes' fish biomass in kg/ha)
    }
    if (full) this._yoyHash();
    if (FRY.DENSITY) this._yTable();   // (stage Y1: the young available, per column × species × length — before anyone feeds)
    if (F3.WILD) this._wildPrep(dt); else if (this._wRho) this._wRho.fill(0);   // (E4: the wildlife's demand and the fish it can reach now)
    if (ALEWIFE.ON && S3.alewife) { this._aleDay(); this._alewife(dt); }   // (E8: the sea-run alewives' run, residence and leaving)
    const yf = e.yearFrac(), att = ch.attenuation(), clar = ch.clarity();
    { const yr = this._yr = Math.floor(e.time / YEAR); if (yf >= F3.SITE_YF && yf < 0.5 && this._siteYr !== yr) { this._siteYr = yr; this._siteSub(); } }   // (the plant spawners' grounds, each spring)
    // the surface's light now (lux), and for a coarse block its mean over the block (a block across dusk sees its fall)
    const lux0 = e.lux, luxB0 = coarse ? [lux0, e.luxAhead(dt / 2), e.luxAhead(dt)] : null;
    this._cx = { yf, att, clar, lux0 };
    if (!mixed) {
      this._mixOn = false;
      if (coarse && F3.FRESH_HASH) {
        // A COARSE BLOCK IN TWO PASSES: every fish decides and moves; the lakes' hash is rebuilt where they all got to; then every fish
        // feeds, spawns, breathes and meets its hazards. In one pass a fish's strikes (and its mate search) looked for the others
        // through the hash of the block's START while they had moved ~28 m since (the true lakes): it found prey only where their
        // start cells lay near where it had got to — the far fish's predation ran ~9× below the formula's, the near fish's (fine
        // steps, a fresh hash) at its full rate (docs/GPU_SIM.md "Strikes: a finding about the CPU sim"; G3)
        const go = this._go || (this._go = []); go.length = f.length;
        for (let i = 0; i < f.length; i++) { const a = f[i]; go[i] = a.alive && this._liveMove(a, i, dt, mv, coarse, luxB0); }
        this._hashBuild(false);
        for (let i = 0; i < f.length; i++) { const a = f[i]; if (go[i] && a.alive) this._liveRest(a, i, dt, mv, coarse); }
      } else for (let i = 0; i < f.length; i++) { const a = f[i]; if (a.alive) this._live(a, i, dt, mv, coarse, luxB0); }
    }
    else this._stepMixed(dt, mv, full);
    if (mixed) this._stepYoyMixed(dt, mv, yf, full); else { this._yMixOn = false; this._stepYoy(dt, mv, yf); }
    if (FRY.DENSITY) this._ySettle();   // (the step's requests on the young, settled order-free)
    if (mixed ? this.time - (this._mergeAt ?? -1e9) >= F3.FAR_BLOCK : this.stepNo % F3.MERGE_EVERY === 0) { this._mergeAt = this.time; this._schools(); this._mergeYoy(); }
    this._coarse = coarse;
    if (!mixed) {
      if (this.stepNo % 20 === 0 || this.yoy.some(q => !q.alive)) this.yoy = this.yoy.filter(q => q.alive);
      if (this.stepNo % 20 === 0 || f.some(a => !a.alive)) this.fish = f.filter(a => a.alive);
    } else if (this.stepNo % 50 === 0) {   // (with a focus the far fish die in their blocks nearly every fine step: the dead wait — every loop skips
      // them — and the lists are compacted every 50 steps, then the fish's indices and the lakes' hash rebuilt)
      this.yoy = this.yoy.filter(q => q.alive); this.fish = this.fish.filter(a => a.alive);
      for (let i = 0; i < this.fish.length; i++) this.fish[i]._i = i;
      this._needHash = true; this._region = null; this._yRegion = null;
    }
  }
  // ONE FISH'S STEP: dtA s of its life (mvA of its swimming; a coarse block when co, its light luxB over the block)
  _live(a, i, dtA, mvA, co, luxB) { if (this._liveMove(a, i, dtA, mvA, co, luxB)) this._liveRest(a, i, dtA, mvA, co); }
  // ITS STEP'S FIRST HALF: its surroundings, the decision, the drives, the move — false if it died (stranded)
  _liveMove(a, i, dtA, mvA, co, luxB) {
    const m = this._livePre(a, i, dtA, mvA, co, luxB); if (!m) return false;
    const e = this.env;
    // decide (senses → brain), then the innate drives, then move
    if (co || (this.stepNo + a.id) % F3.DECIDE_EVERY === 0 || !a._dh) {
      // learning (on the decision just acted on: rewarded if it ate since), then the next decision (a coarse block: one)
      if (a._dh) { reinforce3(a.lw, a.g, HID3, a.h, a.o, a._ate ? 1 : 0, co ? dtA : dtA * F3.DECIDE_EVERY); a._ate = false; }
      this._sense(a, i); this._brain(a, m, mvA);
    }
    else if (a.prey && !a.prey.alive) { a.prey = null; a.fk = 0; }
    this._drive(a, m, co ? 0 : mvA);
    const c0 = a.c, j0 = a.j, jb0 = a.jb;   // (SHARDS: the cells it started the step in — its own shard's)
    if (co) this._relocate(a, m, dtA); else this._move(a, mvA);
    this._posAt(a, i);
    // (SHARDS: it swam into another shard's water — it finishes this step feeding and breathing where it was, in its own water, and is
    // handed over after it; a block's relocation had moved its cells to where it got to)
    if (this.shard && this.shard.owner[e.colAt(a.x, a.y)] !== this.shard.me) { a._out = true; a.c = c0; a.j = j0; a.jb = jb0; }
    return true;
  }
  // ITS STEP'S SECOND HALF: the body, food (strikes at fish among them), spawning, its breath, the hazards
  _liveRest(a, i, dtA, mvA, co) {
    const s = a.s, sp = s.sp, ch = this.chem, G = this.G;
    const T = a.T, bp = (sp.bioJuv && (sp.juvW ? a.W < sp.juvW : a.age < YEAR)) ? sp.bioJuv : sp.bio;
    const cm = this._energetics(a, bp, T, dtA);
    const ate = co ? this._feed(a, i, cm, a.visF, dtA) : (this.stepNo + a.id) % F3.DECIDE_EVERY === 0 ? this._feed(a, i, cm, a.visF, dtA * F3.DECIDE_EVERY) : false;
    a.hunger = 1 - clamp(a.gut / (sp.gut * a.W), 0, 1);
    if (ate) a._ate = true;
    if (a.ripe) this._spawn(a, i, dtA);
    // O₂: this step's respiration (all n fish) from the fish's water
    ch.o2[a.j] = Math.max(0, ch.o2[a.j] - a.n * a.rO2 * dtA / (G.vol[a.j] * ENV.O2_MGL));
    this._hazards(a, T, dtA);
  }
  // THE START OF A FISH'S STEP (its own clocks, its surroundings, ripeness, a plant spawner's place, moving between the lakes, its
  // sight and cover, its fear fading) — returns its habitat mode now, or null if it died (stranded). Split out of _live so that the
  // GPU engine's checks (docs/GPU_SIM.md) can run it alone on every fish; a.visF is its feeding's sight over the step
  _livePre(a, i, dtA, mvA, co, luxB) {
    const s = a.s, e = this.env, ch = this.chem, G = this.G, { yf, att, clar, lux0 } = this._cx;
    this._coarse = co;
    a.age += dtA; a.mateCd -= dtA; if (a.missCd > 0) a.missCd -= dtA; if (a.nt > 0) { a.nt -= dtA; if (a.K < BROOD.GUARD_QUIT) a.nt = 0; }   // (a guard grown too thin leaves its nest)
    if (!a.mature && this._matureAt(a)) a.mature = true;
    // surroundings
    a.bed = Math.max(0.05, GEO.depthAt(a.x, a.y));
    const c = a.c = e.colAt(a.x, a.y);
    if (c < 0) { this._tallyDeath(s.key, 'stranded', a.n); a.alive = false; a.cause = 'stranded'; return null; }   // (never: movement keeps fish in the water)
    const k = Math.min(G.nL[c] - 1, Math.max(0, (a.z / G.DZ) | 0)), j = a.j = G.cell0[c] + k;
    a.jb = this.bedCell(c, a.bed);
    a.T = e.temp[j]; a.o2 = ch.o2[j];
    { const was = a.ripe; a.ripe = this._ripe(a, yf, e.ice[c], e.temp[G.cell0[c]]); if (a.ripe && !was && i < this._hashN) this._ripeAdd(i); if (!a.ripe) a.inRun = false; }
    if (a.ripe && s.spawn.sub && !this.sites[s.key] && (a.spX !== a.spX || a.spYr !== this._yr)) { this._pickSpot(a); a.spYr = this._yr; }   // (a plant spawner's place: chosen once a season — ripeness flickers at its temperatures' edge)
    this._roam(a, yf, dtA);
    const iceCut = 1 - e.iceCut * e.ice[c], fade = Math.exp(-att * a.z);
    const kI = K_I[s.key] ?? 1, lf = iceCut * fade;
    a.vis = Math.max(s.nonVis, sight(lux0 * lf, kI)) * clar;
    const visDay = luxB ? Math.max(s.nonVis, (sight(luxB[0] * lf, kI) + 2 * sight(luxB[1] * lf, kI) + sight(luxB[2] * lf, kI)) / 4) * clar : a.vis;   // (its feeding's sight)
    a.visF = visDay;
    a.cover = Math.max(this._inWeeds(a, c, this._coarse && F3.BED_SHARE), this._riffle(a));   // (the weeds' stems — in them; the brook's riffles. The shallows: the predator's reach, _strike)
    if (s.bury && a.bed - a.z <= F3.BURY_H && !(s.buryL > 0 && a.L > s.buryL)) a.cover = Math.max(a.cover, s.bury * clamp((9 - a.T) / 4, 0, 1));   // (dug into the mud in winter — S3 buryL: only the fish up to buryL cm)
    if (s.rockC > 0 && a.L <= s.rockL) { if (LIT3.SUB_MAP) { const gi = cellIndex(a.x, a.y); if (gi >= 0) a.cover = Math.max(a.cover, s.rockC * Math.min(1, GEO.crev[gi] / LIT3.CREV_FULL)); }   // (E1: the stones the bed's map puts there)
      else if (a.bed < LIT3.CR_ROCK_Z) a.cover = Math.max(a.cover, s.rockC * clamp((LIT3.CR_ROCK_Z - a.bed) / 0.5, 0, 1)); }   // (S3 rockC: among the rocky shallows' stones — no substrate map yet: the wave-washed shallows < CR_ROCK_Z, as the crayfish's shelter)
    a.fear *= Math.exp(-F3.FEAR_DECAY * mvA);
    return this._mode(a);
  }
  // THE MIXED STEP (fidelity by distance): the fish within the focus live this fine step with the focus's own hash; a fish coming
  // into it first lives its time since its last block as one; one leaving it starts banking. The far fish are SCHEDULED: each due
  // FAR_BLOCK s after its last block (staggered by id, so each step carries ~1/(FAR_BLOCK/dt) of them), then lives that time as one
  // coarse block with the lakes' hash (built once a simulated second) — the rest of the 300,000 are not touched this step
  _stepMixed(dt, mv, full) {
    const f = this.fish, fo = this.focus, e = this.env, rIn2 = fo.r * fo.r, rOut2 = rIn2 * F3.FOCUS_HYST * F3.FOCUS_HYST, NB = Math.max(1, Math.round(F3.FAR_BLOCK / dt));
    const lux0 = this._cx.lux0, luxPast = this._luxPast || (this._luxPast = new Map()); luxPast.clear();
    const blockLux = d => { const k = Math.round(d * 10); let l = luxPast.get(k); if (!l) luxPast.set(k, l = [e.luxAhead(-d), e.luxAhead(-d / 2), lux0]); return l; };   // (a block's light: the time just past)
    if (!this._mixOn || this._nb !== NB) {   // (a run with a focus starts: every fish's index and near flag, the far fish's schedule)
      this._mixOn = true; this._nb = NB; this._bk = Array.from({ length: NB }, () => []);
      for (let i = 0; i < f.length; i++) {
        const a = f[i]; a._i = i; if (!a.alive) continue; a.near = (a.x - fo.x) ** 2 + (a.y - fo.y) ** 2 < rIn2;
        if (a.near) { a._t0 = this.time; a._due = -1; } else { const st = (a.id * 0.6180339887) % 1; a._t0 = this.time - st * F3.FAR_BLOCK; this._sched(a, Math.max(1, Math.round((1 - st) * NB))); }
      }
      full = true;
    }
    if (full || !this._region) this._regionBuild(fo, Math.sqrt(rOut2) + F3.REGION_M);
    this._localHash();
    this._useHash(this._lh);
    let nn = 0;
    for (const a of this._region) {
      if (!a.alive) continue;
      const wasNear = a.near, near = a.near = (a.x - fo.x) ** 2 + (a.y - fo.y) ** 2 < (wasNear ? rOut2 : rIn2);
      if (!near) { if (wasNear) { a._t0 = this.time; this._sched(a, NB); } continue; }
      nn++;
      if (!wasNear) { a._due = -1; const d = this.time - a._t0; if (d > 1.5 * dt) { a._t0 = this.time; this._live(a, a._i, d, d, true, blockLux(d)); continue; } }
      this._live(a, a._i, dt, mv, false, null); a._t0 = this.time;
    }
    this.nearN = nn;   // (the agents living second by second this step: the view's worker sizes the focus by it)
    this._useHash(this._gh);
    const slot = this.stepNo % NB, due = this._bk[slot]; this._bk[slot] = [];
    for (const a of due) {
      if (!a.alive || a.near) continue;   // (lazy: a fish that came near or died)
      if (a._due !== this.stepNo) { if (a._due > this.stepNo && a._due % NB === slot) this._bk[slot].push(a); continue; }   // (a whole block ahead shares this slot: kept; a rescheduled one: dropped)
      const d = this.time - a._t0; a._t0 = this.time; this._sched(a, NB);
      this._live(a, a._i, d, d, true, blockLux(d));
    }
  }
  _sched(a, steps) { const t = this.stepNo + steps; a._due = t; this._bk[t % this._nb].push(a); }
  // the fish within R of the focus (once a simulated second: the near ones and those about them)
  _regionBuild(fo, R) {   // (always just after the lakes' hash: P is where every fish is)
    const R2 = R * R, L = this._region = [], f = this.fish, P = this.P;
    for (let i = 0, n = this._hashN; i < n; i++) { const o = 4 * i; if ((P[o] - fo.x) ** 2 + (P[o + 1] - fo.y) ** 2 < R2 && f[i].alive) L.push(f[i]); }
    this._regionR = R;
  }
  // the focus's own hash: the region's fish at this step's positions, on a grid over the region alone
  _localHash() {
    const fo = this.focus, R = this._regionR, HC = F3.HC, X0 = fo.x - R, Y0 = fo.y - R, HX = Math.ceil(2 * R / HC) + 1, HY = HX, NH = HX * HY, L = this._region, n = L.length;
    let h = this._lh; if (!h || h.HX !== HX || h.I.length < n) h = this._lh = { S: new Int32Array(NH + 1), I: new Int32Array(Math.max(256, n * 2)), cell: new Int32Array(Math.max(256, n * 2)), cur: new Int32Array(NH), HX, HY };
    h.X0 = X0; h.Y0 = Y0; const S = h.S; S.fill(0);
    for (let q = 0; q < n; q++) { const a = L[q], c = clamp(((a.y - Y0) / HC) | 0, 0, HY - 1) * HX + clamp(((a.x - X0) / HC) | 0, 0, HX - 1); h.cell[q] = c; S[c + 1]++; }
    for (let c = 0; c < NH; c++) S[c + 1] += S[c];
    h.cur.set(S.subarray(0, NH));
    for (let q = 0; q < n; q++) h.I[h.cur[h.cell[q]]++] = L[q]._i;
  }
  _useHash(h) { this.hStart = h.S; this.hItems = h.I; this.HX = h.HX; this.HY = h.HY; this.hX0 = h.X0; this.hY0 = h.Y0; }

  // ---------- SHARDS (docs/TRUE_SCALE.md T5): several Fish3 share one water model, each holding the fish and young of its own
  // columns (owner[c] === me: by water — Upper and the brook; Lower). A fish's step reads and writes only its own water: the
  // columns about it and its foraging footprint are its shard's (the lists filtered here, once); one that swims into another's
  // water finishes its step in the cells it started in and is handed over (takeOut → the set → adopt). The lake-wide couplings — the young's
  // density, the recruitment cap, the fish biomass the zooplankton answer — come from the set (shard3.js) each step
  setShard(me, owner, budgetHa) {
    this.shard = { me, owner, budgetHa };
    const own = c => owner[c] === me;
    this.nbr = this.nbr.map(l => l.filter(own)); this.nbr2 = this.nbr2.map(l => l.filter(own));
    this._fp = new Map(); this._fpOwn = own;
    this.fish = this.fish.filter(a => own(this.env.colAt(a.x, a.y))); this.yoy = this.yoy.filter(q => own(this.env.colAt(q.x, q.y)));
    this._needHash = true; this._region = null; this._yRegion = null;
    if (me > 0) zeroTally(this.stats);   // (the founding's tallies — the season's spawnings so far — are the lakes': counted once, in shard 0)
  }
  // the fish and young that left this shard's water this step, packed (plain data: a structured clone carries them to another
  // worker); they leave this shard's lists
  takeOut() {
    const out = { fish: [], yoy: [] };
    for (const a of this.fish) if (a.alive && a._out) { a._out = false; out.fish.push(packFish(a)); a.alive = false; a.cause = 'handed'; }
    for (const q of this.yoy) if (q.alive && q._out) { q._out = false; out.yoy.push(packYoy(q)); q.alive = false; }
    return out;
  }
  adopt(pack) {
    for (const d of pack.fish) { const a = unpackFish(d); this.fish.push(a); if (this._mixOn) { a._i = this.fish.length - 1; a.near = false; a._t0 = this.time; this._sched(a, this._nb); } }
    for (const d of pack.yoy) { const q = unpackYoy(d); this.yoy.push(q); if (this._yMixOn) { q._t0 = this.time; this._ysched(q, this._ynb); } }
  }

  // THE FOCUS (fidelity by distance): fish within r m of (x, y) live second by second, the rest in banked blocks; null: all alike
  setFocus(x, y, r) { this.focus = x === null || x === undefined ? null : { x, y, r }; }

  // ---------- senses: one pass over the neighbours (food fish, the nearest threat, the school) + the food fields ----------
  _sense(a, i) {
    const s = a.s, f = this.fish, R = Math.max(0.6, a.senseR * a.vis), Rt = Math.max(0.8, a.senseR * 1.1 * a.vis), Ra = F3.ALLY_R;
    const RR = Math.max(R, Rt, Ra), R2 = RR * RR;
    a.prey = null; a.threat = null; a.td = -1; a.fk = 0; a.fd = -1; a.fv = 0; a.an = 0;
    let pd = R, td = Rt, sx = 0, sy = 0, sz = 0, sn = 0;
    const canEat = s.pisc && a.L >= s.sp.Lpisc;
    const gx0 = clamp(((a.x - RR - this.hX0) / F3.HC) | 0, 0, this.HX - 1), gx1 = clamp(((a.x + RR - this.hX0) / F3.HC) | 0, 0, this.HX - 1);
    const gy0 = clamp(((a.y - RR - this.hY0) / F3.HC) | 0, 0, this.HY - 1), gy1 = clamp(((a.y + RR - this.hY0) / F3.HC) | 0, 0, this.HY - 1);
    const S = this.hStart, I = this.hItems, P = this.P;
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const c = gy * this.HX + gx;
      for (let q = S[c]; q < S[c + 1]; q++) {
        const jx = I[q]; if (jx === i) continue;
        const o = 4 * jx, dx = P[o] - a.x, dy = P[o + 1] - a.y, dz = P[o + 2] - a.z, d2 = dx * dx + dy * dy + dz * dz; if (d2 > R2) continue;   // (where it is: P)
        const b = f[jx]; if (!b.alive) continue;
        const d = Math.sqrt(d2);
        if (b.k === a.k && d < Ra) { sx += b.x * b.n; sy += b.y * b.n; sz += b.z * b.n; sn += b.n; }
        if (d < td && this.canPrey(b, a)) { td = d; a.threat = b; }
        if (canEat && d < pd && this.canPrey(a, b)) { pd = d; a.prey = b; }
      }
    }
    if (a.threat) { a.td = td; a.fear = Math.max(a.fear, clamp(1 - td / Rt, 0, 1)); }
    if (sn > 0) { a.ax = sx / sn; a.ay = sy / sn; a.az = sz / sn; a.an = sn; }
    if (a.prey) { a.fk = 1; a.fx = a.prey.x; a.fy = a.prey.y; a.fz = a.prey.z; a.fd = pd; a.fv = 1; return; }
    // the fields: the richest bed (bottom feeders) or zooplankton (planktivores) about it — its own column and the next ones
    const G = this.G, ch = this.chem, small = !s.pisc || a.L < 3 * s.sp.Lpisc || s.cray;
    if (s.benthic && small) {
      let best = BENTHOS.SENSE_MIN, bc = -1;
      // (its own patch by the bed cell it feeds from; the columns about it — two rings — by their mean-depth bed)
      const tryC = (cc, jb) => { if (jb < 0 || ch.o2[jb] < a.o2Crit) return; const E = ch.benth[jb] / A2 - BENTHOS.REFUGE; if (E > best) { best = E; bc = cc; } };
      tryC(a.c, a.jb); const nb = this.nbr2[a.c]; for (let q = 0; q < nb.length; q++) tryC(nb[q], this.colBedJ[nb[q]]);
      if (bc >= 0) {
        const v = best / (best + (F3.SHARE ? F3.K_BENTH : BENTHOS.K_FISH));
        if (v > a.fv) { a.fk = 2; a.fv = v; a.fx = bc === a.c ? a.x : G.cx[bc]; a.fy = bc === a.c ? a.y : G.cy[bc]; a.fz = a.bed - 0.15; }   // (bed food is on the bed: it follows the bed it is over)
      }
    }
    if (s.plank || a.L < s.sp.Lzoo) {
      const K = F3.K_ZOO; let best = PLANKTON.SENSE_MIN * K, bj = -1;
      const k0 = a.j - G.cell0[a.c];
      const tryJ = jj => { const E = ch.zooE(jj); if (E > best) { best = E; bj = jj; } };
      tryJ(a.j); if (k0 > 0) tryJ(a.j - 1); if (k0 < G.nL[a.c] - 1) tryJ(a.j + 1);
      const nb = this.nbr[a.c]; for (let q = 0; q < nb.length; q++) { const cc = nb[q]; tryJ(G.cell0[cc] + Math.min(G.nL[cc] - 1, k0)); }
      if (bj >= 0) {
        const v = best * best / (best * best + K * K);
        if (v > a.fv) { const cc = G.colOfCell[bj]; a.fk = 3; a.fv = v; a.fx = cc === a.c ? a.x : G.cx[cc]; a.fy = cc === a.c ? a.y : G.cy[cc]; a.fz = G.zMid[bj]; }
      }
    }
    if (a.fk >= 2) { const dx = a.fx - a.x, dy = a.fy - a.y; a.fd = Math.hypot(dx, dy, a.fz - a.z); }
  }
  // can `p` eat `q`: a fish-eater at its piscivorous length, q's body no deeper than p's gape and not too small to bother with
  canPrey(p, q) {
    const s = p.s; if (!s.pisc || p.L < s.sp.Lpisc || p === q) return false;
    return q.bdep * (q.s.spineW || 1) <= p.gape && q.L >= FEED.PREY_MIN * p.L && q.L <= s.preyLR * p.L;   // (spineW: a bullhead's locked pectoral and dorsal spines widen what a mouth must take — S3 spineW)
  }

  // ---------- the brain ----------
  _brain(a, m, dt) {
    a._dh = this.deeper(a.x, a.y, a._dh || [0, 0]);   // (the lake's smoothed slope toward deeper water: the band's steering reads it too)
    this.senses(a, this._inp, a._dh);
    forward3(a.g, a.lw, this._inp, a.h, a.o, HID3, a.active, a.leak);
  }
  // what a fish senses now — its brain's inputs (IN3) into inp; dh: the bed's slope at it (deeper). Reads the fish only: the data
  // page's card calls it with its own buffers
  senses(a, inp, dh) {
    const s = a.s, cy = Math.cos(a.yaw), sy = Math.sin(a.yaw);
    const rel = (tx, ty, o) => { const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy) || 1e-6; inp[o] = (dx * sy - dy * cy) / d; inp[o + 1] = (dx * cy + dy * sy) / d; };   // (right, ahead)
    if (a.fk) { rel(a.fx, a.fy, 0); inp[2] = clamp((a.z - a.fz) / 2, -1, 1); inp[3] = a.fk === 1 ? clamp(1 - a.fd / Math.max(0.6, a.senseR), 0, 1) : a.fv; }
    else inp[0] = inp[1] = inp[2] = inp[3] = 0;
    if (a.threat) { rel(a.threat.x, a.threat.y, 4); inp[6] = clamp((a.z - a.threat.z) / 2, -1, 1); inp[7] = a.fear; } else inp[4] = inp[5] = inp[6] = inp[7] = 0;
    if (a.an > 0) { rel(a.ax, a.ay, 8); inp[10] = clamp(a.an / 8, 0, 1); } else inp[8] = inp[9] = inp[10] = 0;
    inp[11] = clamp(a.z / 6, 0, 1); inp[12] = clamp((a.bed - a.z) / 3, 0, 1); inp[13] = clamp(a.bed / 6, 0, 1);
    inp[14] = clamp(1 - GEO.shoreDist(a.x, a.y) / F3.FAR, 0, 1);
    const gx = dh[0], gy = dh[1]; inp[15] = gx * sy - gy * cy; inp[16] = gx * cy + gy * sy;
    inp[17] = a.vis; inp[18] = clamp((a.T - s.sp.tempOpt) / 10, -1, 1); inp[19] = clamp(a.o2 / 1.2, 0, 1);
    inp[20] = a.energy; inp[21] = a.hunger; inp[22] = a.fear;
    const hd = Math.hypot(a.hx - a.x, a.hy - a.y);
    if (hd > 0.5) rel(a.hx, a.hy, 23); else inp[23] = inp[24] = 0;
    inp[25] = clamp(hd / (2 * s.home), 0, 1);
    return inp;
  }

  // ---------- innate drives: steer (yaw rate), a target depth (pitch) and thrust ----------
  _drive(a, m, dt) {
    const s = a.s, o = a.o, tm = a.turnMax;
    // the brain's turn, high-passed: a constant bias (a fresh random brain's) would only make the fish circle; it steers by change
    a.tAvg += (o[0] - a.tAvg) * Math.min(1, dt / F3.TURN_HP);
    let yr = (o[0] - a.tAvg) * tm * F3.BRAIN_TURN;
    // (each pull also adds to a heading vector and says how far it needs the fish to go — the coarse block's: _relocate. A block's
    // drive, dt 0, reads only those: the turn, the look ahead and the pitch are the fine swim's, and _move alone reads them)
    let vx = 0, vy = 0, wTop = 0, wNeed = Infinity;
    const fine = dt > 0;
    const steer = (bx, by, w, nd = Infinity) => {
      if (fine) yr += angDiff(Math.atan2(by, bx), a.yaw) * tm * w;
      const d = Math.hypot(bx, by); if (!(d > 1e-9) || !(w > 0)) return;
      vx += w * bx / d; vy += w * by / d; if (w > wTop) { wTop = w; wNeed = nd; }
    };
    // habitat: back into the bottom-depth band (downhill when too shallow, uphill when too deep)
    const [lo, hi] = m.bot, [gx, gy] = a._dh; let off = 0, goTrip = 0;
    // A GOAL — its nest, a spawning riffle up the brook, last year's nest, the brook's pools for the summer, home across the
    // brook — reached along the brook's path where it lies in another water (_route); while on the way, the band waits
    const G0 = this._goal(a, this._g0 || (this._g0 = [0, 0, 0]));
    if (G0) {
      const r = this._route(a, G0[0], G0[1], this._g1 || (this._g1 = [0, 0])), d = Math.hypot(G0[0] - a.x, G0[1] - a.y);
      if (d > G0[2]) { const dr = Math.hypot(r[0] - a.x, r[1] - a.y); steer(r[0] - a.x, r[1] - a.y, (a.nt > 0 ? BROOD.GUARD_TETHER : F3.GOAL_W) * clamp(d / 3, 0.3, 1), r[0] === G0[0] && r[1] === G0[1] ? d - 0.8 * G0[2] : dr); if (a.nt <= 0) { goTrip = clamp((d - G0[2]) / 3, 0, 1); a._far = d > F3.FAR; } }
    }
    // (a fish losing condition strays from its preferred water to feed: the band's pull weakens, the food's grows)
    const needy = a.hunger * clamp((0.95 - a.K) / 0.15, 0, 1);
    if (!goTrip) {
      const hw = F3.HAB_W * (1 - 0.8 * needy);
      const bw = F3.BAND_REL ? Math.min(1, Math.max(0.25, hi - lo)) : 1;   // (F3.BAND_REL: the pull per band-width outside it, for bands under 1 m)
      if (a.bed < lo) { off = lo - a.bed; if (gx || gy) steer(gx, gy, hw * clamp(off / bw, 0.2, 1), (off + 0.1 * (hi - lo)) / F3.BAND_SLOPE); }
      else if (a.bed > hi) { off = a.bed - hi; if (gx || gy) steer(-gx, -gy, hw * clamp(off / bw, 0.2, 1), (off + 0.1 * (hi - lo)) / F3.BAND_SLOPE); }
      off *= 1 - needy;
      // ITS COVER (S3 seek, the review's phase 3 item 13): by day in the open-water season, toward the best cover about it — the
      // weeds' stands and the shallows beyond a large predator's reach (the young's cover, _yoyTarget cov) — fully while small (≤
      // seek.L cm), at seek.big larger: pumpkinseed shelter in the weeds until their deep bodies outgrow the gapes ("predation
      // ceases at ~7 cm"), redbreast at the stony and wooded margins (no substrate map yet: the shallows stand in); without it
      // they held a depth band and 77 % of the pumpkinseed founders were eaten in year 1
      const sk = s.seek; if (sk && this.env.sun > 0.02 && a.T > 9 && a.c >= 0) {
        const G = this.G, pl = this.env.plants, rk = s.rockC > 0 && a.L <= s.rockL ? s.rockC : 0, cv = cc => Math.max(F3.SHALLOW_REFUGE * clamp((0.8 - G.depthMean[cc]) / 0.6, 0, 1), pl ? pl.standCover(this.colBedJ[cc]) : 0, rk * (LIT3.SUB_MAP ? Math.min(1, this.colCrev[cc] / LIT3.CREV_FULL) : clamp((LIT3.CR_ROCK_Z - G.depthMean[cc]) / 0.5, 0, 1)));   // (and the rocky shallows for a rock dweller: S3 rockC)
        const nb = this.nbr[a.c], v0 = cv(a.c); let best = v0, bc = -1; for (let q = 0; q < nb.length; q++) { const v = cv(nb[q]); if (v > best) { best = v; bc = nb[q]; } }
        if (bc >= 0 && best > v0 + 0.05) { const dx = G.cx[bc] - a.x, dy = G.cy[bc] - a.y; steer(dx, dy, sk.w * (a.L <= sk.L ? 1 : sk.big) * (1 - needy), Math.hypot(dx, dy)); }
      }
      // its shore band (S3 shore): back toward the nearest shore — down the gradient of the distance to it
      if (m.s1 > 0) { const d = GEO.shoreDist(a.x, a.y); if (d > m.s0) { const h = GEO.CELL, sX = GEO.shoreDist(a.x + h, a.y) - GEO.shoreDist(a.x - h, a.y), sY = GEO.shoreDist(a.x, a.y + h) - GEO.shoreDist(a.x, a.y - h); if (sX || sY) steer(-sX, -sY, hw * clamp((d - m.s0) / Math.max(1e-3, m.s1 - m.s0), 0.2, 1), d - 0.9 * m.s0); } }
    }
    // a ripe fish of a species that pairs heads for the nearest ripe fish of the other sex it knows of
    if (a.ripe && a.mate && a.mate.alive && a.mate.ripe && !(a.brookRun && !this._runs(a) && GEO.bodyAt(a.mate.x, a.mate.y) === BROOK)) { const d = Math.hypot(a.mate.x - a.x, a.mate.y - a.y); if (d > F3.MATE_R * 0.6) steer(a.mate.x - a.x, a.mate.y - a.y, 0.8 * clamp(d / 3, 0.3, 1), d - 0.5 * F3.MATE_R); }   // (not a turned-back runner after a mate in the brook)
    // food: forage toward it (hungry), pursue a prey fish — less while it is on its way to its habitat (the dusk and dawn moves
    // go whatever the food), and no lingering in a patch then
    // (a RIPE fish hunts and forages at RIPE_HUNT of its pull: spawners keep feeding, less — so on its way to spawn the ground's
    // pull beats a passing prey's; research_notes/Whole lake 3D fish simulation/fallfish_spawning_brook.md §3. At true scale the
    // ripe fallfish the full brook turned back stayed in it chasing its dace, the prey's pull at a hungry fish's 1.55 over the
    // ground's 1.5)
    const going = clamp(off - 0.3, 0, 1), inPatch = a.fk >= 2 && a.fd < 1.5 && going <= 0, hk = a.ripe ? F3.RIPE_HUNT : 1;
    if (a.fk === 1) steer(a.fx - a.x, a.fy - a.y, hk * F3.PURSUIT_W * clamp(1 - a.fd / Math.max(0.6, a.senseR), 0.2, 1) * (0.4 + 0.6 * a.hunger), a.fd - 0.5 * s.strikeR);
    else if (a.fk >= 2 && !inPatch) steer(a.fx - a.x, a.fy - a.y, hk * F3.FORAGE_W * a.hunger * a.fv * (1 - 0.8 * going) * (1 + needy), Math.hypot(a.fx - a.x, a.fy - a.y));
    // a threat: away from it (small fish also toward the shallows)
    if (a.threat && a.fear > 0.05) {
      let bx = a.x - a.threat.x, by = a.y - a.threat.y; const d = Math.hypot(bx, by) || 1; bx /= d; by /= d;
      if (a.L < 15 && (gx || gy)) { bx -= 0.6 * gx; by -= 0.6 * gy; }
      steer(bx, by, F3.FLEE_W * a.fear, F3.FLEE_D * a.senseR);
    }
    // its own kind: schools keep together (their agents meet and merge); loose aggregations (sunfish colonies)
    const coh = !a.school && s.school ? F3.SOLO_COHERE : s.cohere;   // (a schooling species' fish with its own brain schools by choice)
    if (a.an > 0 && coh > 0) { const d = Math.hypot(a.ax - a.x, a.ay - a.y); if (d > 1) steer(a.ax - a.x, a.ay - a.y, coh * clamp(a.an / 6, 0, 1), d - 1); }
    // home range
    const hd = Math.hypot(a.hx - a.x, a.hy - a.y);
    if (hd > s.home && !G0) { const r = this._route(a, a.hx, a.hy, this._g1 || (this._g1 = [0, 0])); steer(r[0] - a.x, r[1] - a.y, F3.HOME_W * clamp((hd - s.home) / s.home, 0, 1), r[0] === a.hx && r[1] === a.hy ? hd - 0.7 * s.home : Math.hypot(r[0] - a.x, r[1] - a.y)); }
    // O2_SEEK: short of O₂, across the lake toward better water too, not only up — under the ice toward the inflows and the
    // brook's mouth (15,000 fish crowded an oxygenated inlet in a Michigan winterkill — Cooper & Washburn 1946; perch and
    // other fish move horizontally out of hypoxic water under ice)
    const seek = a.o2 < a.o2Crit ? this._o2Better(a.c) : -1;
    if (seek >= 0) steer(this.G.cx[seek] - a.x, this.G.cy[seek] - a.y, F3.O2_W * clamp(1.3 - a.o2 / a.o2Crit, 0.3, 1.3), Math.hypot(this.G.cx[seek] - a.x, this.G.cy[seek] - a.y));
    // look ahead for shallows and shore: turn toward the deeper side
    // (only water too shallow to swim in is an obstacle — a rising bed the fish follows by its depth control)
    if (fine) {
      const look = Math.max(0.8, a.spd * F3.LOOK), cy = Math.cos(a.yaw), sy = Math.sin(a.yaw), need = F3.ZTOP + F3.ZBOT + 0.05 + a.L / 400;
      const dAhead = GEO.depthAt(a.x + cy * look, a.y + sy * look);
      if (dAhead < need || GEO.bodyAt(a.x + cy * look, a.y + sy * look) === LAND) {
        const l = a.yaw + 0.8, r = a.yaw - 0.8, dl = GEO.depthAt(a.x + Math.cos(l) * look, a.y + Math.sin(l) * look), dr = GEO.depthAt(a.x + Math.cos(r) * look, a.y + Math.sin(r) * look);
        yr += (dl >= dr ? 1 : -1) * tm * F3.AVOID_W;
      }
      a.yawRate = clamp(yr, -tm, tm);
      // depth: the habitat's, the food's when foraging, up out of low O₂, down out of heat
      a.pitchT = clamp((a.z - this._zWant(a, m)) * F3.PITCH_K, -F3.PITCH_MAX, F3.PITCH_MAX) + o[1] * F3.PITCH_MAX * F3.BRAIN_PITCH;
    }
    a._vx = vx; a._vy = vy; a._need = wNeed;
    // ESCAPE from water near its lethal O2: straight up and out, fast (world.js escUp)
    a.esc = a.o2 < F3.ESC_O2 * lethalO2(a.o2Lethal, a.o2Ice, a.T) || a.o2 < 0.5 * a.o2Crit ? 1 : 0;
    if (a.esc) a.pitchT = F3.ESC_PITCH;
    // thrust: cruise × the mode's activity × the brain (0.5–1.5), travel, the actions
    // the brain's actions act in their context: a strike at prey it senses, a flight from a threat it senses (or its fear)
    const aS = a.fk === 1 ? engaged(o[3]) : 0, aF = a.threat || a.fear > 0.1 ? engaged(o[4]) : 0, aH = engaged(o[5]);
    // a fish outside its habitat (the dusk and dawn moves, a long way from home) travels at up to its 30-min sustained speed —
    // the dusk hour is ~5 s of the sim's day, so the move is made at the pace a real fish keeps up for half an hour
    let th = s.uRoutine * m.act * (0.5 + o[2]);
    const trip = Math.max(goTrip, clamp(Math.max((off - 0.2) / 0.3, G0 ? 0 : hd / s.home - 1.5), 0, 1));
    if (trip > 0) th = Math.max(th, trip * s.sustain / s.sprint * (0.75 + 0.5 * o[2]));
    if (goTrip > 0 && a._far) th = Math.max(th, Math.min(0.5, F3.MIGRATE_V / Math.max(1e-3, a.spdMax)));   // a long migration
    if (inPatch && a.hunger > 0.2) th *= FEED.RESIDE;
    const burst = Math.max(ACTION.STRIKE_BURST * aS, ACTION.FLEE_BURST * Math.max(aF, a.fear > 0.4 ? a.fear : 0));
    th = (th + (1 - th) * burst) * (1 - ACTION.HIDE_STILL * aH);
    a.thrust = clamp(th * coldPerf(a.T, s.sp.tempOpt, s.sp.coldPerf), 0, 1);
    if (a.esc) a.thrust = Math.max(a.thrust, 0.7);
    else if (seek >= 0) a.thrust = Math.max(a.thrust, s.sustain / s.sprint);   // (searching for better water at its sustained pace)
    if (a.nt > 0 && !a.esc && G0 && Math.hypot(G0[0] - a.x, G0[1] - a.y) < G0[2]) a.thrust = Math.min(a.thrust, s.uRoutine * BROOD.HOVER);   // hovering over its nest
  }

  // the depth it wants: the habitat's, the food's when foraging, up out of low O₂, down out of heat
  _zWant(a, m) {
    let zT = this._zTarget(a, m);
    // (a hungry fish whose best food is on the bed goes right down to it — half-way it could feed on neither; Werner et al. 1983)
    if (a.fk && (a.fk === 1 || a.hunger > 0.3)) zT += (a.fz - zT) * (a.fk === 1 ? 0.8 : smooth(0.1, 0.4, a.hunger * a.fv));
    if (a.o2 < a.o2Crit) zT = Math.min(zT, a.z - 0.5);
    if (a.T > a.s.tPref + a.tempTol / 4) zT = Math.max(zT, a.z + 0.5);
    return clamp(zT, F3.ZTOP, Math.max(F3.ZTOP, a.bed - F3.ZBOT));
  }

  // ---------- movement in 3-D, kept in the water ----------
  _move(a, dt) {
    a.yaw += a.yawRate * dt; if (a.yaw > Math.PI) a.yaw -= 2 * Math.PI; else if (a.yaw < -Math.PI) a.yaw += 2 * Math.PI;
    const pm = a.esc ? F3.ESC_PITCH : F3.PITCH_MAX;
    a.pitch += (a.pitchT - a.pitch) * Math.min(1, F3.PITCH_RATE * (a.esc ? 3 : 1) * dt); a.pitch = clamp(a.pitch, -pm, pm);
    a.spd += (a.thrust * a.spdMax - a.spd) * Math.min(1, F3.DRAG * dt);
    const hs = Math.cos(a.pitch) * a.spd * dt;
    let nx = a.x + Math.cos(a.yaw) * hs, ny = a.y + Math.sin(a.yaw) * hs, nz = a.z - Math.sin(a.pitch) * a.spd * dt;
    let bed = GEO.depthAt(nx, ny);
    const zTop = F3.ZTOP + F3.ICE_M * (a.c >= 0 ? this.env.ice[a.c] : 0);
    const nb = GEO.bodyAt(nx, ny), keep = a.s.brookRes && nb !== BROOK && GEO.bodyAt(a.x, a.y) === BROOK;   // (the brook's own turn back at its mouths)
    if (nb === LAND || keep || bed < zTop + F3.ZBOT + 0.02 || this.env.colAt(nx, ny) < 0) {   // (a 0-m edge cell belongs to no water column)
      // too shallow: stay put and turn toward deeper water
      nx = a.x; ny = a.y; bed = a.bed; a.spd *= 0.6;
      const [gx, gy] = GEO.downhill(a.x, a.y); if (gx || gy) a.yaw += angDiff(Math.atan2(gy, gx), a.yaw) * Math.min(1, 6 * dt);
    }
    a.x = nx; a.y = ny; a.z = clamp(nz, zTop, Math.max(zTop, bed - F3.ZBOT));
  }

  // ---------- a COARSE BLOCK's movement (stage R3; the human's choice: the brain decides per block) ----------
  // The fish goes where its drives point — its depth band, its nest or goal (along the brook's path), a mate, food, away from
  // a threat, its school, home, better water — its heading bent by its brain's turn, at the pace its drive and brain set
  // (a.thrust): hop by hop through the water (each hop as long as its strongest pull needs, at most a RELOC_N-th of the block's
  // swim), re-aimed from where it got to, until nothing pulls or the block's swimming is spent; the rest of the block it works
  // the place it reached (a wander of v·√(τ·rest) within its depth band); its depth goes to the drives' target
  _relocate(a, m, dt) {
    const v = Math.max(1e-3, a.thrust * a.spdMax), x0 = a.x, y0 = a.y; let left = v * dt, hops = 0;
    const hopMax = Math.max(F3.RELOC_MIN, left / F3.RELOC_N);
    while (left > 1e-3 && hops < F3.RELOC_N) {
      if (hops) { a.bed = Math.max(0.05, GEO.depthAt(a.x, a.y)); a.c = this.env.colAt(a.x, a.y); a._dh = this.deeper(a.x, a.y, a._dh); this._drive(a, m, 0); }
      if (Math.hypot(a._vx, a._vy) < F3.RELOC_STILL) break;
      const h = Math.atan2(a._vy, a._vx) + a.o[0] * F3.BRAIN_BEND, len = Math.min(left, hopMax, Math.max(F3.RELOC_MIN, a._need));
      const gone = this._hop(a, h, len); left -= Math.max(gone, 0.5 * F3.RELOC_MIN); hops++;
      if (gone < 0.25 * len) break;   // (a shore in the way: the next block finds the way round)
    }
    if (left > 1e-3 && !(a.nt > 0)) { const r = Math.min(left, v * Math.sqrt(F3.WANDER_TAU * left / v)); if (r > 0.05) this._hop(a, rand() * Math.PI * 2, r, m); }
    // a nest guard is on its nest at the block's scale (its chases of intruders last seconds): within GUARD_R of it
    const wet = (x, y) => GEO.bodyAt(x, y) !== LAND && GEO.depthAt(x, y) >= F3.ZTOP + F3.ZBOT && this.env.colAt(x, y) >= 0;
    if (a.nt > 0) {
      const dx = a.x - a.nx, dy = a.y - a.ny, d = Math.hypot(dx, dy);
      if (d > F3.GUARD_R) { const k = F3.GUARD_R / d, gx = a.nx + dx * k, gy = a.ny + dy * k; if (wet(gx, gy)) { a.x = gx; a.y = gy; } else if (wet(a.nx, a.ny)) { a.x = a.nx; a.y = a.ny; } }
    }
    if (!wet(a.x, a.y)) { a.x = x0; a.y = y0; }   // (never off the water: back where the block began)
    a.spd = v; a.pitch = 0; a.pitchT = 0;
    a.bed = Math.max(0.05, GEO.depthAt(a.x, a.y)); a.c = this.env.colAt(a.x, a.y);
    if (a.fk === 2) a.fz = a.bed - 0.15;   // (bed food is on the bed it got to)
    const zTop = F3.ZTOP + F3.ICE_M * (a.c >= 0 ? this.env.ice[a.c] : 0);
    a.z = clamp(this._zWant(a, m), zTop, Math.max(zTop, a.bed - F3.ZBOT));
    if (a.c >= 0) { const G = this.G; a.j = G.cell0[a.c] + Math.min(G.nL[a.c] - 1, Math.max(0, (a.z / G.DZ) | 0)); a.jb = this.bedCell(a.c, a.bed); }   // (it feeds and breathes where it got to)
  }
  // one straight hop of up to len m along heading h through the water, a bed-grid cell at a time: it stops before land or water
  // too shallow to swim in — and, given the mode m (a wander), before leaving its depth band. Returns the distance gone
  _hop(a, h, len, m = null) {
    const cx = Math.cos(h), cy = Math.sin(h), n = Math.max(1, Math.ceil(len / GEO.CELL)), st = len / n;
    const ice = a.c >= 0 ? this.env.ice[a.c] : 0, shallow = F3.ZTOP + F3.ICE_M * ice + F3.ZBOT + 0.05 + a.L / 400;
    const inBand = m && a.bed >= m.bot[0] && a.bed <= m.bot[1];
    // (a fish in water with enough O₂ won't swim on into water short of it: it senses hypoxia and stays at the oxic water's edge —
    // under the ice, fish crowd there rather than following their winter depth into dead water)
    const oxic = a.o2 >= a.o2Crit, G = this.G, o2 = this.chem.o2, inBrook = a.s.brookRes && GEO.bodyAt(a.x, a.y) === BROOK;
    let gone = 0;
    for (let k = 0; k < n; k++) {
      const nx = a.x + cx * st, ny = a.y + cy * st, bed = GEO.depthAt(nx, ny), c = this.env.colAt(nx, ny), b = GEO.bodyAt(nx, ny);
      if (!(bed >= shallow) || b === LAND || c < 0 || (inBrook && b !== BROOK)) break;   // (the brook's own don't leave it)
      if (inBand && (bed < m.bot[0] || bed > m.bot[1])) break;
      if (oxic && o2[G.cell0[c] + Math.min(G.nL[c] - 1, Math.max(0, (Math.min(a.z, bed) / G.DZ) | 0))] < a.o2Crit) break;
      a.x = nx; a.y = ny; a.bed = bed; gone += st;
    }
    if (gone > 0) a.yaw = h;
    return gone;
  }

  // ---------- the body: digestion, waste, respiration, gonads, growth (FB4; world.js) ----------
  _energetics(a, bp, T, dt) {
    const s = a.s, sp = s.sp, Wg = a.W, dd = dt / DAY, cm = coldCmax(sp.cold, bp, sp.bio, Wg, T);   // (a juvenile stand-in's appetite in the cold: the species' own — bioenergetics.js coldCmax)
    let C = 0, pNow = 0;
    if (a.gut > 0) {
      // (gastric evacuation: proportional to the gut's contents — exact over the step — at most Cmax a day)
      const ev = Math.min(a.gut * expm(Math.max(BIOE.GER * Math.exp(BIOE.GER_T * T) * sp.gerMul, cm / sp.gut) * dd), cm * Wg * dd);
      C = a.gutE * ev / a.gut; a.gut -= ev; a.gutE -= C; pNow = ev / Math.max(1e-12, cm * Wg * dd);
      a.cons += ev;
    }
    a.consMax += cm * Wg * dd;
    wasteFractions(bp, T, clamp(pNow, 0, 1), WF);
    const F = WF[0] * C, U = WF[1] * (C - F), S = bp.SDA * (C - F);
    a.uAvg += (a.spd / Math.max(1e-6, a.spdMax) - a.uAvg) * Math.min(1, dd);
    const act = a.nt > 0 ? 1 : Math.exp(BIOE.SWIM * Math.max(0, a.uAvg - s.uRoutine));   // (swimming beyond the routine: the routine is in the respiration; a guard's chases are in its ×)
    const depress = 1 - 0.3 * clamp((0.9 - a.K) / (0.9 - 0.55), 0, 1);
    const rO2 = coldResp(sp.cold, bp, sp.bio, Wg, T) * a.metabMul * act * depress * (a.nt > 0 ? BROOD.GUARD_METAB3[guardStage(a)] : 1) * Wg;   // g O₂ a day (FB4's routine respiration, the species' cold rule below its T1; a guardian works harder)
    a.rO2 = rO2 / DAY;
    let net = C - F - U - S - rO2 * OXYCAL * dd;
    const ed = energyDensity(bp, Wg), gsi = s.gsi(a.sex);
    if (net > 0 && a.mature && a.gon < gsi * Wg) { const toG = Math.min(net * (s.reproA ?? BIOE.REPRO_ALLOC), (gsi * Wg - a.gon) * ed); a.gon += toG / ed; net -= toG; }   // (S3 reproA: its own share)
    else if (net <= 0 && a.gon > 0 && a.K < BIOE.K_RESORB) { const fromG = Math.min(a.gon * ed, -net); a.gon -= fromG / ed; net += fromG; }
    // its mass for its energy: below its standard weight the energy density follows its condition (bioenergetics.js energyOf: a
    // deficit takes the fat first), at and above it FB4's own — it grows in length
    const Ws = stdWeight(sp.lw, a.L), gK = a.age < YEAR ? BIOE.ED_K_JUV : BIOE.ED_K;
    a.W = Math.max(1e-6, massOf(energyOf(Wg, Ws, ed, gK) + net, Ws, ed, gK));
    if (a.W > Ws) a.L = lengthFor(sp.lw, a.W);
    this._settle(a);
    return cm;
  }

  // THE HUNGER GATE's opening (F3.HUNGER_GATE) for a fish with `gut` g in its gut: 1 − gut / G. S3 pGate: G is the gut that empties
  // at pGate × its Cmax — G = pGate · Cmax · W / k, k its gastric evacuation a day (as _energetics evacuates) — so when prey abound
  // it takes ~pGate of its Cmax at any size and temperature; S3 G0: G = G0 × W, a fixed share of its weight (that capped a 15-cm
  // bass at p 0.20–0.27 against the 0.48–0.60 it needs, and pickerel at p 0.13: its evacuation is slow); neither: no gate
  _gate(a, cm, gut = a.gut) {
    const G = this._gateG(a, cm); if (!(G > 0)) return 1;
    return clamp(1 - gut / Math.max(1e-9, G), 0, 1);
  }
  _evac(a, cm) { const sp = a.s.sp; return Math.max(BIOE.GER * Math.exp(BIOE.GER_T * a.T) * sp.gerMul, cm / sp.gut); }   // (its gastric evacuation a day, as _energetics)
  _gateG(a, cm) { const s = a.s; return s.pGate > 0 ? s.pGate * cm * a.W / Math.max(1e-9, this._evac(a, cm)) : s.G0 > 0 ? s.G0 * a.W : 0;
  }

  // ---------- feeding: fish, the bed's worms and scuds, zooplankton, the bed's organic layer (poor food) ----------
  _feed(a, i, cm, visDay, dt) {
    const s = a.s, sp = s.sp, ch = this.chem, gmax = sp.gut * a.W, n = a.n;
    const o2L = lethalO2(a.o2Lethal, a.o2Ice, a.T);
    const gEff = gmax * clamp((a.o2 - o2L) / Math.max(1e-3, a.o2Crit - o2L), 0, 1) * (a.nt > 0 ? BROOD.GUARD_FEED3[guardStage(a)] : 1), apt = gEff / gmax;   // (a guardian eats little — least over its eggs)
    const perf = coldPerf(a.T, sp.tempOpt, sp.coldPerf);
    let sated = false;
    if (F3.REST_DIGEST && F3.HUNGER_GATE && s.pisc && a.L >= sp.Lpisc) { const G = this._gateG(a, cm); if (G > 0 && a.gut >= G) a.missCd = Math.max(a.missCd, Math.log(a.gut / (F3.REST_TO * G)) / this._evac(a, cm) * DAY); sated = F3.REST_ALL && G > 0 && a.missCd > 0 && a.gut > F3.REST_TO * G; }   // (F3.REST_DIGEST: sated — it rests while it digests)
    if (sated) return false;   // (F3.REST_ALL: resting, it forages for nothing — not the crayfish, the weeds' insects or the bed's either)
    const rest = F3.REST_DIGEST && a.missCd > 0;
    let room = gEff - a.gut; if (!(room > 0)) return false;
    let want = cm * apt * a.W * dt / DAY, got = 0;   // what it can take this step (per fish)
    // THE HUNGER GATE (F3.HUNGER_GATE, S3 G0): a predator hunts and forages in proportion to how empty it is, h = 1 − gut / (G0 × its
    // weight) — wild bass hold ~0.4 % of their weight (Lake Ontario), use a third to a half of their gut, rest after a meal; the
    // 8-%BW gut as the only brake let a bass eat at Cmax wherever prey were about (research piscivore_field_feeding_rates.md (b))
    const hg = F3.HUNGER_GATE ? this._gate(a, cm) : 1; if (!(hg > 0)) return false; want *= hg;
    // (F3.YCOLD: its hunting of the young at its own appetite's temperature curve — FB4 consumptionT, ~0 under the ice — not only its
    // cold performance, 0.4–0.55 at 0–2 °C: in arm O the young killifish were still eaten 13–22 % a fortnight at 0.5 °C, where the
    // field's first winters lose ~40–50 % in all (Neuswanger et al. 2015) and winter predation is low)
    const cT = F3.YCOLD || F3.SCOLD ? consumptionTrel((sp.bioJuv && (sp.juvW ? a.W < sp.juvW : a.age < YEAR)) ? sp.bioJuv : sp.bio, a.T) : 1;   // (relative: bioenergetics consumptionTrel)
    const yEff = F3.YCOLD ? Math.min(perf, cT) : perf, sEff = F3.SCOLD ? Math.min(perf, cT) : perf;
    const g0 = a.gut;
    // (F3.STRIKE2: the young first — a summer predator's bulk — and the followed fish with the room left; else the old order)
    let yAsk = 0;
    // (F3.YENC: the young met through its strikes' volume — RD the strike reach × its sight, as _strike2, × the share of the time it hunts)
    const actY = s.act[this.env.sun > 0.3 ? 0 : this.env.sun > 0.02 ? 1 : 2], rd0 = F3.YENC && s.pisc && a.L >= sp.Lpisc ? s.strikeR * Math.max(0.3, visDay) : 0;
    const encV = rd0 > 0 ? Math.PI * rd0 ** 2 * (F3.ENC_U + s.vHunt) * actY * yEff : 0, hS = F3.YWIN_CS && encV > 0 ? 1 / (actY * yEff * s.aMax) : 0;   // (hS: an attack's share of its hunting time, 1/aMax — F3.YWIN_CS)
    if (F3.STRIKE2 && FRY.DENSITY && room > 0 && want > got) { const p0 = s.pisc && a.L >= sp.Lpisc, pisc = p0 && !rest; yAsk = this._yReq(a, null, a.c, n, a.L, a.gape, cm * apt * a.W * hg / DAY, dt, Math.min(room, want - got), pisc, !p0 || a.L < 3 * sp.Lpisc, yEff * (s.larvNight && !p0 ? 1 : visDay), s.preyLR, encV, rd0, hS) || 0; }   // (S3 larvNight: no sight needed — the alewife)
    if (s.pisc && a.L >= sp.Lpisc && a.missCd <= 0 && room - yAsk > 0) { const g = this._strike(a, i, room - yAsk, visDay, sEff * hg, dt); if (g > 0) { a.gut += g; a.gutE += g * this._preyED; room -= g; got += g; this.stats.food.fish += g; } }
    // young-of-year: a piscivore works a school of young fish, a plankton eater picks at the larvae it is in
    if (!(F3.STRIKE2 && FRY.DENSITY) && room > 0 && want > got) {
      if (FRY.DENSITY) { const p0 = s.pisc && a.L >= sp.Lpisc, pisc = p0 && !rest; this._yReq(a, null, a.c, n, a.L, a.gape, cm * apt * a.W * hg / DAY, dt, Math.min(room, want - got), pisc, !p0 || a.L < 3 * sp.Lpisc, yEff * (s.larvNight && !p0 ? 1 : visDay), s.preyLR); }   // (settled at the step's end: _ySettle)
      else { const g = this._eatYoy(a, room, perf, dt); if (g > 0) { a.gut += g; a.gutE += g * this._preyED; room -= g; got += g; this.stats.food.yoy += g * n; } }
    }
    // THE BED OR THE OPEN WATER: a fish can't search the mud and the open water at once — it spends its foraging time where it
    // pays best, shared toward the better food (t ∝ f^SHARE_Q): pond bluegill moved between the open water and the sediments
    // within days as their profitability changed (Werner et al. 1983); perch > 5 cm switch to the bed when the zooplankton runs
    // low (Wu & Culver 1992). (SHARE 0: both at once, the 2-D sim's way)
    // (stage 7b) THE BED AND ITS WEEDS: the worms and scuds within reach of the bed, the weeds' large insects (and snails for a
    // molluscivore) within the canopy; THE SURFACE (emerging and fallen insects) for an insect eater near it — littoral3.js
    const small = !s.pisc || a.L < 3 * sp.Lpisc || s.cray, lit = this.env.lit;
    const reach = F3.BENTH_REACH + a.L / 200, hb = a.bed - a.z, canopy = lit ? this.env.plants._canopy[a.c] : 0, share = this._coarse && F3.BED_SHARE;
    const fNear = a.jb < 0 ? 0 : share ? reachShare(reach, hb) : hb <= reach ? 1 : 0;   // (a coarse block: its share of the block within reach — F3.BED_SHARE)
    const IR = s.insR || 0;   // (S3 insR m: a fish that darts into the weeds and rises to the surface for insects reaches them this much farther)
    const fWeed = a.jb < 0 || !lit ? 0 : share ? reachShare(reach + canopy + IR, hb) : hb <= reach + canopy + IR ? 1 : 0;
    const nearBed = fNear > 0, inWeeds = fWeed > 0;
    const moll = !!sp.diet.snail && a.L >= (sp.Lsnail || 0);
    // (stage 7c) a crayfish eater on the bed takes the crayfish its gape fits, at its strike success; the big ones (bass and
    // pickerel past 3 × their piscivory length) no longer bother with worms and scuds
    const cs = s.cray && nearBed && lit ? +sp.diet.cray * fNear / Math.max(fWeed, 1e-9) : 0, big = s.pisc && s.cray && a.L >= 3 * sp.Lpisc;   // (the crayfish by its share near the bed; the weeds' fauna by its share in them — Ew × fWeed below)
    const canB = s.benthic && small && (nearBed || inWeeds), canZ = s.plank || a.L < sp.Lzoo, canS = !!lit && !!sp.diet.insect && small && a.z <= LIT3.SURF_Z + IR;
    // its footprint: the bed cells within FP_DZ of its depth, and its layer (± one in its own column) of the water, in the
    // columns within its forage radius
    const G = this.G, fp = this._footprint(s.forageR, a.c), LB = this._fpB, LZ = this._fpZ; let nB = 0, nZ = 0;
    const kz = Math.min(G.nL[a.c] - 1, Math.max(0, (a.z / G.DZ) | 0));
    for (let q = 0; q < fp.length && nB < LB.length - 16; q++) {
      const cc = fp[q];
      if (canB) { const bl = this.colBed[cc]; for (let k = 0; k < bl.length; k++) if (Math.abs(G.zMid[bl[k]] - a.bed) <= F3.FP_DZ) LB[nB++] = bl[k]; }
      if (canZ && nZ < LZ.length - 4) { const j0 = G.cell0[cc], k1 = Math.min(G.nL[cc] - 1, kz); if (cc === a.c) { for (let k = Math.max(0, k1 - 1); k <= Math.min(G.nL[cc] - 1, k1 + 1); k++) LZ[nZ++] = j0 + k; } else LZ[nZ++] = j0 + k1; }
    }
    if (canB && !nB && a.jb >= 0) LB[nB++] = a.jb;
    const sm = F3.SMALL_S && (sp.diet.larva || sp.diet.insect || sp.diet.plankton) ? clamp((LIT3.SM_L[1] - a.L) / (LIT3.SM_L[1] - LIT3.SM_L[0]), 0, 1) : 0;   // (F3.SMALL_S)
    const Eb = canB && nearBed && !big ? ch.benthEcells(LB, nB) * fNear : 0, Ew = canB && lit ? lit.weedEcells(LB, nB, moll, a.gape, cs, 1, sm) * fWeed : 0, Es = canS ? lit.surfEcols(fp, fp.length) : 0;
    const KB = F3.SHARE ? F3.K_BENTH : BENTHOS.K_FISH, fB = Eb + Ew > 0 ? (Eb + Ew) / (Eb + Ew + KB) : 0, fS = Es > 0 ? Es / (Es + LIT3.K_SURF) : 0;
    let tB = canB ? 1 : 0, tZ = canZ ? 1 : 0;
    if (F3.SHARE && canB && canZ) {
      const Ez = ch.zooEcells(LZ, nZ), fZ = Ez * Ez / (Ez * Ez + F3.K_ZOO * F3.K_ZOO);
      const qB = fB ** F3.SHARE_Q, qZ = fZ ** F3.SHARE_Q; tB = qB + qZ > 0 ? qB / (qB + qZ) : 0.5; tZ = 1 - tB;
    }
    const want0 = want - got;
    if (tB > 0 && room > 0 && want > got && fB > 0) {   // the bed's worms and scuds and the weeds' fauna, by what each offers
      const wB = Math.min(room, want0 * tB * BENTHOS.Q) * n * fB * visDay;   // (by its sight: perch hunt the bed by eye, bullheads and suckers by taste — their nonVis)
      const gb = Eb > 0 ? ch.takeBenthCells(LB, nB, wB * Eb / (Eb + Ew), 0) / n : 0, gw = Ew > 0 ? lit.takeWeedCells(LB, nB, wB * Ew / (Eb + Ew), moll, a.gape, cs, 1, sm) / n : 0, Jw = Ew > 0 ? lit.J / n : 0, gc = Ew > 0 ? lit.crG : 0;
      if (gb > 0) { a.gut += gb; a.gutE += gb * PREY.BENTH_ED; room -= gb; got += gb; this.stats.food.benth += gb * n; }
      if (gw > 0) { a.gut += gw; a.gutE += Jw; room -= gw; got += gw; this.stats.food.weed += gw * n - gc; this.stats.food.cray += gc; if (gc > 0) this.stats.crayBy[s.key] = (this.stats.crayBy[s.key] || 0) + gc; }
    }
    if (canS && room > 0 && want > got && fS > 0) {   // the surface: emerging midges and mayflies, the land's beetles and flies — taken
      // as met by a fish near it, whatever else it is about (big, conspicuous items: no search time of their own)
      const g = lit.takeSurfCols(fp, fp.length, Math.min(room, want0 * fS) * n * visDay) / n;
      if (g > 0) {
        a.gut += g; a.gutE += g * PREY.INSECT_ED; room -= g; got += g; this.stats.food.surf += g * n;
        // (the insects, one by one: each a rise for the view — a school's fish rise together)
        a.surfG += g * n; const k = Math.min(F3.RISE_MAX, Math.floor(a.surfG / F3.INSECT_G));
        if (k > 0) { a.surfG -= k * F3.INSECT_G; if (a.surfG > F3.RISE_MAX * F3.INSECT_G) a.surfG = 0; if (this.rises.length < 3000) this.rises.push(a.x, a.y, a.L, a.k, a.id, k); }
      }
    }
    if (tZ > 0 && room > 0 && want > got) {
      const out = this._zo || (this._zo = [0, 0, 0]);
      ch.zooFeedCells(LZ, nZ, 1, 1 - ZOO3.COPE_ESCAPE, Math.min(room, (F3.SHARE ? want0 * tZ : want - got) * PLANKTON.Q) * n, F3.K_ZOO, out, true, true, 0, visDay * visDay);   // (seen by its own eyes at this hour: the water it searches ∝ its reaction distance² — Gerritsen & Strickler 1977)
      const g = (out[0] + out[1] + out[2]) / n;
      if (g > 0) { a.gut += g; a.gutE += (out[0] * PREY.DAPH_ED + out[1] * PREY.COPE_ED + out[2] * PREY.ROT_ED) / n; room -= g; got += g; this.stats.food.zoo += g * n; }
    }
    // poor food when nothing else was had: a bottom-sifter takes the bed's organic layer
    if (got <= 0 && s.sift && a.jb >= 0 && a.bed - a.z <= F3.BENTH_REACH + a.L / 200) {
      const pRoom = Math.min(gEff, FEED.POOR_GUT * gmax) - a.gut;
      if (pRoom > 0) { const g = ch.takeSedOM(a.jb, Math.min(pRoom, (want - got)) * n) / n; if (g > 0) { a.gut += g; a.gutE += g * PREY.DETRITUS_ED * PREY.DETRITUS_DIG; got += g; this.stats.food.sed += g * n; } }
    }
    if (a.gut > g0) this.stats.intakeBy[s.key] = (this.stats.intakeBy[s.key] || 0) + (a.gut - g0) * n;
    const ate = a.gut - g0 >= PLANKTON.BITE_MIN * gmax * (dt / OLD_S) / (1 / 30);   // (a meal: the 2-D bite threshold per 1/30-s step; compat)
    if (ate) a.eaten++;
    return ate;
  }
  // a piscivore's strike: the kill hazard over the catchable fish within its reach; one fish taken (a school loses one)
  // THE ENCOUNTER–STRIKE–CAPTURE RULE (F3.STRIKE2): the catchable fish of its water column within ENC_R m — each fish of a school
  // an encounter, × its concealment, its cover, the shallows it may be in — give the prey density; encounters E = π·RD²·(u + v)·N;
  // strikes S = aMax·E/(E + ENC_EH); each lands with the prey's capture success (its kind's against this predator's, × the size
  // term, a school's confusion for bass and perch-like predators); one kill a block at most, the fish struck ∝ encounters × success
  _strike2(a, i, room, visDay, perf, dt) {
    const s = a.s, f = this.fish, lunge = 1 + ACTION.STRIKE_REACH * (a.fk === 1 ? engaged(a.o[3]) : 0), cls = s.predCls;
    const RD = s.strikeR * lunge * Math.max(0.3, visDay), Rs = F3.ENC_R, Rs2 = Rs * Rs, dmH = 0.5 * F3.SHALLOW_K * a.L;
    let sE = 0, sW = 0, sWp = 0, best = null;   // (sWp: the choice's weights — sW × the size preference)
    const gx0 = clamp(((a.x - Rs - this.hX0) / F3.HC) | 0, 0, this.HX - 1), gx1 = clamp(((a.x + Rs - this.hX0) / F3.HC) | 0, 0, this.HX - 1);
    const gy0 = clamp(((a.y - Rs - this.hY0) / F3.HC) | 0, 0, this.HY - 1), gy1 = clamp(((a.y + Rs - this.hY0) / F3.HC) | 0, 0, this.HY - 1);
    const S0 = this.hStart, I = this.hItems, cand = this._cand || (this._cand = []); cand.length = 0;
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const c = gy * this.HX + gx;
      for (let q = S0[c]; q < S0[c + 1]; q++) {
        const b = f[I[q]]; if (!b.alive || I[q] === i) continue;
        const dx = b.x - a.x, dy = b.y - a.y; if (dx * dx + dy * dy > Rs2) continue;
        if (!this.canPrey(a, b) || b.W + b.gon > room) continue;
        // (an esocid meets a school of n as n^schoolExp fish — 0.65: it finds a school about as it finds one big fish and takes one fish
        // an attack, its success unreduced inside it (Turesson & Brönmark 2004) — the encounter dilution the old rule had and STRIKE2
        // first dropped: pickerel then took a 36-fish killifish school as 36 separate fish; bass keep their confusion term below)
        const nb = b.n > 1 ? b.n : 1, ne = nb > 1 && cls === 0 ? Math.pow(nb, s.schoolExp ?? F3.SCHOOL_EXP) : nb, enc0 = ne * (1 - ACTION.HIDE_CONCEAL * engaged(b.o[5])) * (F3.COVER_ONCE ? 1 : 1 - b.cover) * clamp((b.bed - dmH) / dmH, 0, 1) * (F3.ENC_DZ > 0 ? clamp(1 - Math.abs(b.bed - a.bed) / F3.ENC_DZ, 0, 1) : 1);
        if (!(enc0 > 0)) continue;
        const enc = F3.RD_SIZE ? enc0 * (rdOf(RD, b.L) / RD) ** 2 : enc0;   // (F3.RD_SIZE: seen at its own reaction distance)
        const bs = b.s, cz = csOf(bs, cls, b.L / a.L);   // (F3.SIZE_RENORM: 1 at the size ratio CS3 was measured at)
        const cs = cz * (nb > 1 ? (cls === 1 ? Math.pow(nb, F3.BASS_SCH) : cls === 2 ? 0.15 : 1) : 1) * (F3.COVER_CS || F3.COVER_ONCE ? 1 - b.cover : 1);   // (F3.COVER_CS: structure cuts the capture too, not only the encounter — Savino & Stein 1982; F3.COVER_ONCE: only here)
        sE += enc; const w = enc * cs; if (w > 0) { sW += w; const wp = F3.PREY_PREF > 0 ? w * Math.exp(-0.5 * (Math.log(b.L / a.L / F3.PREY_OPT) / F3.PREY_PREF) ** 2) : w; sWp += wp; cand.push(b, wp); }
      }
    }
    if (!(sW > 0)) return 0;
    const E = Math.PI * RD * RD * (F3.ENC_U + s.vHunt) * sE / (Math.PI * Rs2 * Math.max(1, a.bed)), S = s.aMax * E / (E + (F3.EH_AMAX ? s.aMax : F3.ENC_EH));   // (F3.EH_AMAX: Holling's E_h = aMax)
    const sun = this.env.sun, act = s.act[sun > 0.3 ? 0 : sun > 0.02 ? 1 : 2];   // (the share of the time it hunts now)
    if (this._sdiag) this._sdiag(a, E, S, sW / sE, perf, act, sE, cand.length / 2, dt);   // (a probe's hook: the rule's terms — scratchpad prd.mjs; never set by the sim)
    if (rand() >= -Math.expm1(-S * (sW / sE) * perf * act * dt)) return 0;
    let r = rand() * sWp; for (let q = 0; q < cand.length; q += 2) { r -= cand[q + 1]; if (r <= 0) { best = cand[q]; break; } }
    best = best || cand[cand.length - 2];
    return this._killed(a, best);
  }
  // a predator's kill: the prey's grams to its gut (the caller), its energy density, the tallies, one fish from a school
  _killed(a, best) {
    const s = a.s, g = best.W + best.gon; this._preyED = energyDensity(best.s.sp.bio, best.W);
    this.events.push(best.x, best.y, best.z, a.id);
    this.stats.kills++; const key = `${s.key}>${best.s.key}`; this.stats.eatenBy[key] = (this.stats.eatenBy[key] || 0) + 1;
    if (best.n > 1.5) best.n -= 1; else { best.alive = false; best.cause = 'eaten'; best.n = 0; }
    this._tallyDeath(best.s.key, 'eaten', 1);
    a.missCd = FEED.MISS_CD / TS;
    return g;
  }
  _strike(a, i, room, visDay, perf, dt) {
    if (F3.STRIKE2) return this._strike2(a, i, room, visDay, perf, dt);
    const s = a.s, f = this.fish, lunge = 1 + ACTION.STRIKE_REACH * (a.fk === 1 ? engaged(a.o[3]) : 0);
    const R = s.strikeR * lunge * Math.max(0.3, visDay), R2 = R * R, dmH = 0.5 * F3.SHALLOW_K * a.L;   // (dmH: half the water it needs)
    let sK = 0, best = null;
    const gx0 = clamp(((a.x - R - this.hX0) / F3.HC) | 0, 0, this.HX - 1), gx1 = clamp(((a.x + R - this.hX0) / F3.HC) | 0, 0, this.HX - 1);
    const gy0 = clamp(((a.y - R - this.hY0) / F3.HC) | 0, 0, this.HY - 1), gy1 = clamp(((a.y + R - this.hY0) / F3.HC) | 0, 0, this.HY - 1);
    const S = this.hStart, I = this.hItems, cand = this._cand || (this._cand = []); cand.length = 0;
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const c = gy * this.HX + gx;
      for (let q = S[c]; q < S[c + 1]; q++) {
        const b = f[I[q]]; if (!b.alive || I[q] === i) continue;
        const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, d2 = dx * dx + dy * dy + dz * dz; if (d2 > R2) continue;
        if (!this.canPrey(a, b) || b.W + b.gon > room) continue;
        const d = Math.sqrt(d2), hide = 1 - ACTION.HIDE_CONCEAL * engaged(b.o[5]);
        const sel = Math.max(0, 1 - Math.pow(b.bdep / a.gape, F3.SIZE_K));
        const w = (1 - d / R) * s.sp.capture * b.s.sp.vuln * sel * hide * (1 - b.cover) * clamp((b.bed - dmH) / dmH, 0, 1) * (b.n > 1 ? Math.pow(b.n, s.schoolExp ?? F3.SCHOOL_EXP) : 1);
        if (w > 0) { sK += w; cand.push(b, w); }
      }
    }
    if (!(sK > 0)) return 0;
    const rate = F3.ATTACK * perf * dt;
    if (rand() >= 1 - Math.exp(-rate * sK)) return 0;
    let r = rand() * sK; for (let q = 0; q < cand.length; q += 2) { r -= cand[q + 1]; if (r <= 0) { best = cand[q]; break; } }
    best = best || cand[cand.length - 2];
    const g = best.W + best.gon; this._preyED = energyDensity(best.s.sp.bio, best.W);
    this.events.push(best.x, best.y, best.z, a.id);
    this.stats.kills++; const key = `${s.key}>${best.s.key}`; this.stats.eatenBy[key] = (this.stats.eatenBy[key] || 0) + 1;
    if (best.n > 1.5) best.n -= 1; else { best.alive = false; best.cause = 'eaten'; best.n = 0; }
    this._tallyDeath(best.s.key, 'eaten', 1);
    a.missCd = FEED.MISS_CD / TS;
    return g;
  }

  // ---------- REPRODUCTION ----------
  // RIPE: mature, its gonads full (GON_READY of its ripe GSI), in condition, out of its cooldown, not on a nest, in the spawning
  // season and open water, and the water over its ground (its column's surface) near its spawning temperature
  _ripe(a, yf, ice, Ts) {
    const s = a.s, sp = s.sp;
    if (!a.mature || a.mateCd > 0 || a.nt > 0 || yf >= (s.spawnEnd || SPAWN.SEASON_END) || ice >= 0.5) return false;   // (S3 spawnEnd: its own season's end)
    if (a.gon < SPAWN.GON_READY * s.gsi(a.sex) * a.W || a.K < SPAWN.K_READY) return false;
    if (s.spawnP && ((Math.imul(a.id >>> 0, 2654435761) ^ Math.imul((this._yr + 7) >>> 0, 40503)) >>> 0) / 4294967296 >= s.spawnP) return false;   // (E3b S3 spawnP: only this share spawn in a year — a fish's own draw a year)
    return Ts >= sp.spawnT[0] - F3.SPAWN_LEAD && Ts <= sp.spawnT[1] + SPAWN.EDGE;
  }
  // its goal now (x, y, how near counts as there), or null: its nest; a ripe brook spawner's riffle; a faithful nester's
  // last nest; a brook-summering pumpkinseed's pool; home in its lake when it is elsewhere
  _runs(a) { return a.brookRun && a.runYr !== this._yr; }   // (a brook runner this season: not turned back by a full brook)
  _atMouth(a) { const R = F3.RUN_MOUTH, m0 = BP[0], m1 = BP[BLAST]; return (a.x - m0[0]) ** 2 + (a.y - m0[1]) ** 2 < R * R || (a.x - m1[0]) ** 2 + (a.y - m1[1]) ** 2 < R * R; }
  _goal(a, out) {
    const s = a.s;
    if (a.nt > 0) { out[0] = a.nx; out[1] = a.ny; out[2] = 0.5; return out; }
    if (a.leave) { const o = this._outletXY(); out[0] = o[0]; out[1] = o[1]; out[2] = 0.5 * this.G.COL; return out; }   // (E8: a spent alewife out by the outlet)
    if (a.ripe && this._runs(a)) {
      // (a runner reaching the brook's mouth — or in it — takes a nest site if one is free, counted at once so a block's arrivals
      // can't all crowd in; or, the brook full, turns back at the mouth and spawns on its lake's shoals this season. A site frees as
      // its fish spawns and leaves. At true scale thousands arrive within days: turned back only once inside, they milled in the
      // brook by the thousand)
      const K = s.spawn.runK;
      if (K && !a.inRun && (GEO.bodyAt(a.x, a.y) === BROOK || this._atMouth(a))) { if (this.runIn[a.k] + a.n <= K * this.brookA) { a.inRun = true; this.runIn[a.k] += a.n; } else a.runYr = this._yr; }
      if (a.runYr !== this._yr) { const v = BP[a.lake === UPPER ? 3 : 6]; out[0] = v[0]; out[1] = v[1]; out[2] = 2.5; return out; }
    }
    if (a.ripe && s.spawn.faith && a.nestX === a.nestX) { out[0] = a.nestX; out[1] = a.nestY; out[2] = s.spawn.faith; return out; }
    if (a.ripe && a.spX === a.spX) { out[0] = a.spX; out[1] = a.spY; out[2] = 2; return out; }   // (a plant spawner's chosen structure)
    if (a.ripe && this.sites[s.key]) {   // the nearest of its lake's spawning grounds
      // (a runner the full brook turned back: the ground nearest its home, not the one by the brook's mouth where it stands — there
      // the true lakes' turned-back fallfish milled by the hundred, half on the brook's own cells)
      const tb = a.brookRun && !this._runs(a), best = this._siteNear(s.key, a.lake, tb ? a.lhx : a.x, tb ? a.lhy : a.y);
      if (best) { out[0] = best[0]; out[1] = best[1]; out[2] = 3; return out; }
    }
    if (a.brookie && this._brookSeason(a)) { const v = BP[a.lake === UPPER ? 1 + (a.id & 1) : 4 + (a.id & 1)]; out[0] = v[0]; out[1] = v[1]; out[2] = 3; return out; }
    if (s.brookRes) { if (GEO.bodyAt(a.x, a.y) !== BROOK) { out[0] = a.hx; out[1] = a.hy; out[2] = 1; return out; } return null; }   // (the brook's own stay in it)
    if (a.tripEnd > this.env.time) { out[0] = a.tpx; out[1] = a.tpy; out[2] = 5; return out; }   // (a trip through the brook)
    // (the brook is a PASSAGE for the lakes' fish — they cross it moving lakes, on trips and spawning runs, and the sunfish summer
    // in its pools — and a fish that strays into it goes home. At 1/10 the brook is ~25× the share of the lakes' shallows it is
    // in the real lakes (0.5 % against 0.02 %): with every fish ranging in it, white perch schools at night (171 fish once) and
    // the pickerel grazed and hunted its dace out within the summer. At true scale (TRUE_SCALE.md T1) it can be range again)
    const b = GEO.bodyAt(a.x, a.y);
    if (b !== a.lake && (b !== BROOK || GEO.SCALE < 1)) { out[0] = a.lhx; out[1] = a.lhy; out[2] = 4; return out; }   // (true scale: the brook is range)
    return null;
  }
  // MOVING BETWEEN THE LAKES (F3.ROAM_L, MOVE3): a fish's chance this step of settling in the other lake or setting off on a
  // trip there (not while ripe, nesting, travelling or on a trip), weighted toward the fish living near its lake's mouth of the
  // brook; and the tally of fish that reached the other lake (stats.cross: settlers and trippers alike)
  _roam(a, yf, dt) {
    const b = GEO.bodyAt(a.x, a.y);
    if ((b === UPPER || b === LOWER) && b !== a.inLake) { if (a.inLake === UPPER || a.inLake === LOWER) this.stats.cross[a.s.key] += a.n; a.inLake = b; }
    const mv = a.s.move; if (!mv.settle && !mv.trip) return;
    if (a.ripe || a.nt > 0 || a.tripEnd > this.env.time || b !== a.lake || a.brookie || a.age < YEAR) return;
    const end = a.lake === UPPER ? BP[0] : BP[BLAST], w = Math.exp(-Math.hypot(a.lhx - end[0], a.lhy - end[1]) / (F3.ROAM_L * GEO.SCALE)) / this._roamMean(a.lake);
    const inS = r => !r || (yf >= r[0] && yf < r[1]), span = r => r ? r[1] - r[0] : 1;
    if (mv.settle && inS(mv.yf) && rand() < mv.settle / span(mv.yf) * w * dt / YEAR) {
      const p = this._homeIn(a.s, a.lake === UPPER ? LOWER : UPPER); if (!p) return;
      a.lake = a.lake === UPPER ? LOWER : UPPER; a.lhx = a.hx = p[0]; a.lhy = a.hy = p[1]; this.stats.settle[a.s.key] += a.n;
      a.brookie = false; a.brookRun = a.s.spawn.site === 'brook' && Math.hypot(...(a.lake === UPPER ? BP[0] : BP[BLAST]).map((v, q) => v - (q ? a.lhy : a.lhx))) < F3.BROOK_RUN;
    } else if (mv.trip && inS(mv.tripYf) && rand() < mv.trip / span(mv.tripYf) * w * dt / YEAR) {
      const p = this._homeIn(a.s, a.lake === UPPER ? LOWER : UPPER); if (!p) return;
      a.tpx = p[0]; a.tpy = p[1]; a.tripEnd = this.env.time + mv.tripD * DAY * (0.6 + 0.8 * rand()); this.stats.trips[a.s.key] += a.n;
    }
  }
  // the mean weight e^(−d/ROAM_L) over a lake's water (its fish's chance of crossing averages the species' rate)
  _roamMean(lake) {
    const m = this._rMean || (this._rMean = {});
    if (m[lake] === undefined) { const end = lake === UPPER ? BP[0] : BP[BLAST]; let t = 0, n = 0; for (let i = 0; i < GEO.N; i++) if (GEO.body[i] === lake) { const [x, y] = GEO.cellCentre(i); t += Math.exp(-Math.hypot(x - end[0], y - end[1]) / (F3.ROAM_L * GEO.SCALE)); n++; } m[lake] = Math.max(1e-3, t / Math.max(1, n)); }
    return m[lake];
  }
  // a new home for a fish of species s in a lake: water of its daytime bottom depths, nearer the brook's mouth the likelier
  _homeIn(s, lake) {
    const C = this._hCells || (this._hCells = {}), key = s.key + lake;
    if (!C[key]) { const [lo, hi] = s.hab.day.bot; C[key] = []; for (let i = 0; i < GEO.N; i++) if (GEO.body[i] === lake && GEO.depth[i] >= lo && GEO.depth[i] <= hi) C[key].push(i); }
    const L = C[key]; if (!L.length) return null;
    const end = lake === UPPER ? BP[0] : BP[BLAST];
    for (let t = 0; t < 30; t++) { const i = L[(rand() * L.length) | 0], [x, y] = GEO.cellCentre(i); if (t === 29 || rand() < Math.exp(-Math.hypot(x - end[0], y - end[1]) / (F3.ROAM_L * GEO.SCALE))) return [x, y]; }
    return null;
  }
  // the riffles' refuge for a small fish (or a school of young) in the brook's shallow, running water (F3.RIFFLE_REFUGE)
  _riffle(a) { return a.L < F3.RIFFLE_L && a.bed < F3.RIFFLE_D && GEO.bodyAt(a.x, a.y) === BROOK ? F3.RIFFLE_REFUGE : 0; }
  // THE WEEDS' COVER FOR A FISH IN THEM (stage 7h): the stands on its bed cell (plants3 standCover — each species' share × the cover
  // inside its stand) while it is within the canopy's height of the bed; above the weeds, none — structure protects only the fish
  // that use it (Savino & Stein 1982; weed_bed_structure.md §4). A coarse block: its share of the block within the canopy (heights
  // gamma-distributed about its mean, as its bed feeding — F3.BED_SHARE). (Was the column's mean cover at any height)
  _inWeeds(a, c, share) {
    const pl = this.env.plants; if (!pl || a.jb < 0) return 0;
    const cn = pl._canopy[c]; if (!(cn > 0)) return 0;
    const hb = a.bed - a.z, f = share ? reachShare(cn, hb) : hb <= cn ? 1 : 0;
    return f > 0 ? f * pl.standCover(a.jb) : 0;
  }
  // the brook-summering season: from mid-May while the water is warm (> 14 °C) to the autumn cooling
  _brookSeason(a) { const yf = this.env.yearFrac(); return yf > 0.22 && yf < 0.6 && a.T > 14; }
  // the way to (tx, ty): straight within one water; out of a lake by its end of the brook, then along the brook's path
  _route(a, tx, ty, out) {
    const fb = GEO.bodyAt(a.x, a.y), tb = GEO.bodyAt(tx, ty);
    out[0] = tx; out[1] = ty;
    if (fb === tb || tb === LAND || fb === LAND) return out;
    if (fb === UPPER || fb === LOWER) {
      const v = fb === UPPER ? 0 : BLAST, w = fb === UPPER ? 1 : BLAST - 1, p = Math.hypot(BP[v][0] - a.x, BP[v][1] - a.y) > 2.5 ? BP[v] : BP[w];
      out[0] = p[0]; out[1] = p[1]; return out;
    }
    const ni = nearestBP(a.x, a.y), ti = tb === UPPER ? -1 : tb === LOWER ? BLAST + 1 : nearestBP(tx, ty);
    if (ti === ni) return out;
    const dir = Math.sign(ti - ni); let k = ni + dir;
    if (k >= 0 && k <= BLAST && Math.hypot(BP[k][0] - a.x, BP[k][1] - a.y) < 1.5) k += dir;
    if (k < 0 || k > BLAST) {   // (past the path's end: out through the mouth's gate into the lake, then for the goal — at true scale the
      // straight line from the mouth crossed the bank, and fish leaving the brook for a goal off its line stayed in it)
      const gt = tb === UPPER || tb === LOWER ? GATE[tb] : null;
      if (gt && Math.hypot(gt[0] - a.x, gt[1] - a.y) > 1.5) { out[0] = gt[0]; out[1] = gt[1]; }
      return out;
    }
    out[0] = BP[k][0]; out[1] = BP[k][1]; return out;
  }
  // its mate: a school spawns within itself (both sexes — or with a ripe school beside it); a pairing species needs a ripe
  // fish of the other sex within MATE_R (and heads for the nearest within MATE_CUE meanwhile — the drive)
  _findMate(a, i, R) {
    const f = this.fish, R2 = R * R, RM = this._ripeM, RC = F3.MATE_HC, P = this.P; let best = null, bd = R2;   // (where each is: P, as the senses)
    if (R <= 2 * F3.HC) {   // (a short reach — a school's 3 m — through the 4-m hash: a spawning colony packs hundreds of ripe fish into one index cell)
      const S = this.hStart, I = this.hItems;
      const gx0 = clamp(((a.x - R - this.hX0) / F3.HC) | 0, 0, this.HX - 1), gx1 = clamp(((a.x + R - this.hX0) / F3.HC) | 0, 0, this.HX - 1);
      const gy0 = clamp(((a.y - R - this.hY0) / F3.HC) | 0, 0, this.HY - 1), gy1 = clamp(((a.y + R - this.hY0) / F3.HC) | 0, 0, this.HY - 1);
      for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
        const c = gy * this.HX + gx;
        for (let q = S[c]; q < S[c + 1]; q++) {
          const j = I[q]; if (j === i) continue;
          const o = 4 * j, d2 = (P[o] - a.x) ** 2 + (P[o + 1] - a.y) ** 2 + (P[o + 2] - a.z) ** 2; if (!(d2 < bd)) continue;
          const b = f[j]; if (!b.alive || b.k !== a.k || !b.ripe || (a.sex !== 2 && b.sex !== 2 && b.sex === a.sex)) continue;
          bd = d2; best = b;
        }
      }
      return best;
    }
    if (!RM) return null;
    const m = R + F3.HC;   // (± a hash cell: the index holds the step's start positions)
    const gx0 = Math.max(0, ((a.x - m - GEO.X0) / RC) | 0), gx1 = Math.max(0, ((a.x + m - GEO.X0) / RC) | 0), gy0 = Math.max(0, ((a.y - m - GEO.Y0) / RC) | 0), gy1 = Math.max(0, ((a.y + m - GEO.Y0) / RC) | 0);
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const l = RM.get(this._ripeKey(a.k, gx, gy)); if (!l) continue;
      for (let q = 0; q < l.length; q++) {
        const j = l[q]; if (j === i) continue;
        const o = 4 * j, d2 = (P[o] - a.x) ** 2 + (P[o + 1] - a.y) ** 2 + (P[o + 2] - a.z) ** 2; if (!(d2 < bd)) continue;
        const b = f[j]; if (!b.alive || !b.ripe || (a.sex !== 2 && b.sex !== 2 && b.sex === a.sex)) continue;
        bd = d2; best = b;
      }
    }
    return best;
  }
  // A SPAWNING: on its ground (the bottom-depth band; a brook spawner in the brook), with a mate, at a rate that peaks inside
  // the spawning temperatures. Eggs = fecundity × the female's ripeness; larvae = eggs × hatch success → ONE young-of-year
  // school at the site, its genome a mutated crossover of the parents'; both parents spent (gonads emptied, cooldown); a
  // nest-guarding male takes the nest
  _spawn(a, i, dt) {
    const s = a.s, sp = s.sp, sb = s.spawn;
    // (a spawning run gathers on the brook's riffles: a runner there finds the ripe fish of the run anywhere along it)
    if (this._coarse || (this.stepNo + a.id) % F3.DECIDE_EVERY === 0) {
      // (a pair stays a pair: a mate still ripe and in reach is kept — the search runs only for a fish without one, and at true scale
      // in June tens of thousands of fish are ripe at once)
      const Rm = a.sex === 2 ? 3 : this._runs(a) && GEO.bodyAt(a.x, a.y) === BROOK ? 80 * GEO.BROOK_SCALE : s.mateCue, m = a.mate;   // (the run's reach: not a turned-back fish's)
      if (!(m && m !== a && m.alive && m.ripe && (m.x - a.x) ** 2 + (m.y - a.y) ** 2 + (m.z - a.z) ** 2 < Rm * Rm)) a.mate = a.sex === 2 ? (this._findMate(a, i, 3) || a) : this._findMate(a, i, Rm);
    }
    // (a turned-back runner spawns on its lake's shoals, not on the brook's gravel, as shallow as theirs)
    const inB = GEO.bodyAt(a.x, a.y) === BROOK, onGround = this._runs(a) ? inB : !(inB && a.brookRun) && a.bed >= sb.bot[0] - 0.1 && a.bed <= sb.bot[1] + 0.2;
    if (!onGround || !a.mate || (a.sex === 1)) return;   // (the female, or the school, spawns)
    if (a.spX === a.spX && Math.hypot(a.x - a.spX, a.y - a.spY) > 4 && this._subAt(sb.sub, a.x, a.y) < this._subAt(sb.sub, a.spX, a.spY)) return;   // (a plant spawner lays at its chosen structure, or on as good on its way)
    if (sb.sub && this.sites[s.key]) { const p = this._siteNear(s.key, a.lake, a.x, a.y); if (!p || Math.hypot(p[0] - a.x, p[1] - a.y) > 4) return; }   // (a plant spawner with grounds — chain pickerel — spawns on them: the spring's chosen mats)
    const b = a.mate; if (b !== a && Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) > (a.sex === 2 ? 3 : F3.MATE_R)) return;
    const E = SPAWN.EDGE, [lo, hi] = sp.spawnT, Tq = a.T, f = clamp((Tq - lo + E) / E, 0, 1) * clamp((hi + E - Tq) / E, 0, 1);
    if (!(f > 0) || rand() > 1 - Math.exp(-F3.SPAWN_RATE * f * dt)) return;
    const females = a.sex === 2 ? a.n / 2 : 1;
    const eggs = females * sp.fec.a * Math.pow(a.L, sp.fec.b) * clamp(a.gon / ((F3.EGG_SCHOOL ? s.gsi(a.sex) : sp.gsiF) * a.W), 0, 1), larvae = eggs * (EGG3.ON ? 1 : sp.sHatch) * this._hatchMul(s, a.x, a.y);
    this.stats.eggs[s.key] += eggs; this.stats.spawns[s.key]++; if (EGG3.ON) this.stats.eggs3[s.key].laid += larvae; else this.stats.fry[s.key].hatched += larvae;
    const sa = this.stats.spawnAt[s.key]; if (sa.first < 0) sa.first = this.env.time; sa.bed += a.bed; if (GEO.bodyAt(a.x, a.y) === BROOK) sa.brook++;   // (when and over what water)
    const male = b === a ? null : b, nz = Math.max(0.05, a.bed - 0.03);
    const q = this._mkYoy(a.k, a.x, a.y, nz, larvae, mutate(crossover(a.g, b.g)), mutateGenes(crossoverGenes(a.genes, b.genes)), Math.max(a.gen, b.gen) + 1, (a.hue + b.hue) / 2);
    if (s.guard && male && male.n === 1) {   // the male keeps the nest; its fry stay by it while he does
      male.nt = s.guard; male.nx = a.x; male.ny = a.y; male.nz = nz; q.guard = male.id; q.gref = male; q.nx = a.x; q.ny = a.y; q.hadGuard = true;
      if (sb.faith) { male.nestX = a.x; male.nestY = a.y; }
    }
    a.gon = 0; a.mateCd = s.mateCd; a.ripe = false; a.lastSpawn = this.env.time;
    if (male) { male.gon = 0; male.mateCd = s.mateCd; male.ripe = false; male.lastSpawn = this.env.time; }
  }

  // ============================================================ YOUNG-OF-YEAR ===========================================
  _mkYoy(k, x, y, z, n, g, genes, gen, hue) {
    const q = new Yoy(), s = S3[KEYS3[k]], sp = s.sp;
    q.id = this.nextId++; q.k = k; q.s = s; q.n = n; q.x = q.tx = q._px = x; q.y = q.ty = q._py = y; q.z = q.tz = q._pz = z;
    q.hd = rand() * Math.PI * 2; q.spotBed = Math.max(0.12, GEO.depthAt(x, y));
    q.L = sp.Lhatch; q.W = stdWeight(sp.lw, q.L); q.g = g; q.genes = genes; q.gen = gen; q.hue = hue; q.tk = rand() * F3.YOY_TICK;
    q.bdep = q.L * sp.depthR; q.bed = Math.max(0.05, GEO.depthAt(x, y));
    if (EGG3.ON && EGG3.sp[s.key]) { q.dev = 0; q.eggT0 = q.eggTm = this.env.tempAt(x, y, z); }   // (E3: laid as eggs)
    this.yoy.push(q);
    if (this._yMixOn) { q._t0 = this.time; this._ysched(q, this._ynb); }   // (with a focus: a far school until the region next finds it near)
    return q;
  }
  _yoyHash() {
    const Y = this.yoy, n = Y.length, NH = this.GHX * this.GHY;
    if (!this.yStart) { this.yStart = new Int32Array(NH + 1); this.yCur = new Int32Array(NH); this.yItems = new Int32Array(256); this.yCell = new Int32Array(256); }
    if (this.yItems.length < n) { this.yItems = new Int32Array(n * 2); this.yCell = new Int32Array(n * 2); }
    const S = this.yStart; S.fill(0);
    for (let i = 0; i < n; i++) { const c = this._hc(Y[i].x, Y[i].y); this.yCell[i] = c; S[c + 1]++; }
    for (let c = 0; c < NH; c++) S[c + 1] += S[c];
    this.yCur.set(S.subarray(0, NH));
    for (let i = 0; i < n; i++) this.yItems[this.yCur[this.yCell[i]]++] = i;
    this._yoyList = Y;
  }
  // (stage Y1) THE PREY TABLE: per water column × species × length class (log2 from 0.5 cm) the young available to a predator —
  // n × (1 − their cover), a guarded brood × (1 − BROOD.PROTECT) — their summed length, mass and body depth (the bin's means) — and
  // each school's bin and share (its deaths at the settlement)
  _yTable() {
    const G = this.G, NK = KEYS3.length, NS = FRY.NS, ND = yND(), nb = G.NC * NK * NS * ND;
    let T = this._yt;
    if (!T || T.nb !== nb) {
      T = this._yt = { nb, nd: ND, av: new Float64Array(nb), sB: new Float64Array(nb), sL: new Float64Array(nb), sW: new Float64Array(nb), sD: new Float64Array(nb), req: new Float64Array(nb), reqY: new Float64Array(nb), got: new Float64Array(nb), gotF: new Float64Array(nb), rec: [], vol: new Float64Array(G.NC) };
      for (let c = 0; c < G.NC; c++) for (let k = 0; k < G.nL[c]; k++) T.vol[c] += G.vol[G.cell0[c] + k];
    }
    T.av.fill(0); T.sB.fill(0); T.sL.fill(0); T.sW.fill(0); T.sD.fill(0); T.req.fill(0); T.reqY.fill(0); T.got.fill(0); T.rec.length = 0;
    for (const q of this.yoy) {
      q._yb = -1; q._ya = 0; if (!q.alive || q.c < 0 || !(q.n > 0) || q.dev < (EGG3.PROLARVA ? 1 : 2)) continue;   // (E3: the eggs are no strike's prey; E3b: the yolk-sac larvae are)
      const held = q.gref && q.gref.alive && q.gref.nt > 0, a = q.n * (1 - q.cover) * (held ? 1 - BROOD.PROTECT : 1); if (!(a > 0)) continue;
      const s = Math.min(NS - 1, Math.max(0, Math.floor(Math.log2(q.L / 0.5)))), b = ((q.c * NK + q.k) * NS + s) * ND + yDC(q.bed);   // (F3.YDEPTH: by its bed's depth too)
      T.av[b] += a; T.sB[b] += a * q.bed; T.sL[b] += a * q.L; T.sW[b] += a * q.W; T.sD[b] += a * q.bdep; q._yb = b; q._ya = a;
    }
  }
  // A PREDATOR'S REQUEST on the young of its column (a followed fish p, or a school of young piscivores q): Holling II on the bins'
  // densities — clearance FRY.CLEAR_A·L(mm)^CLEAR_B (× eff: its sight, its cold) × the size window (a piscivore: prey within its gape
  // and preyLR) or the larvae it fits (a plankton or insect eater, × LARV_A, by their detectability) × the prey's vulnerability;
  // handling = the prey's mass / imax (g/s a fish); over dt for its n fish, capped by gMax g a fish. Recorded for _ySettle
  _yReq(p, q, c, n, L, gape, imax, dt, gMax, pisc, larv, eff, preyLR, encV = 0, rd0 = 0, hS = 0) {   // (encV m³/s: a followed piscivore's encounter volume — F3.YENC; rd0 its reaction distance to RD_LREF-cm prey, hS s an attack — F3.YWIN_CS)
    const T = this._yt; if (!T || c < 0 || !(gMax > 0) || !(imax > 0) || !(eff > 0)) return;
    const NK = KEYS3.length, NS = FRY.NS, ND = T.nd || 1, NB = NK * NS * ND, b0 = c * NB, V = T.vol[c], cls = (p || q).s.predCls, dmH = 0.5 * F3.SHALLOW_K * L; if (!(V > 0)) return;
    const a0 = FRY.CLEAR_A * Math.pow(L * 10, FRY.CLEAR_B) / DAY * eff, aP = encV > 0 ? encV : a0, A = this._yA && this._yA.length >= NB ? this._yA : (this._yA = new Float64Array(NB));   // (aP: the piscivore's volume, a0 the larva-picker's)
    const ps = (p || q).s, aL = FRY.LARV2 ? larvVol(ps, L) * eff : a0;   // (FRY.LARV2: the larva-picker's own clearance)
    let sA = 0, sAH = 0;
    for (let j = 0; j < NB; j++) {
      A[j] = 0; const av = T.av[b0 + j]; if (!(av > 0)) continue;
      const Lq = T.sL[b0 + j] / av, r = Lq / L, k = (j / (NS * ND)) | 0; let w = 0, wL = 0, att = 0;
      const acc = ND > 1 ? clamp((T.sB[b0 + j] / av - dmH) / dmH, 0, 1) : 1; if (!(acc > 0)) continue;   // (F3.YDEPTH: the shallows' rule, SHALLOW_K)
      if (pisc && T.sD[b0 + j] / av <= gape && r >= FRY.WIN_MIN && r <= preyLR) {
        if (F3.YWIN_CS && encV > 0) { const ps = S3[KEYS3[k]], nbY = F3.YSCHOOL ? (ps.school || (ps.group ? ps.group[1] : 1) || 1) : 1;   // (F3.YSCHOOL: met in its schools)
          att = clamp(0.2 + 0.8 * (Lq - FRY.DETECT_L[0]) / (FRY.DETECT_L[1] - FRY.DETECT_L[0]), 0.2, 1) * (F3.RD_SIZE && rd0 > 0 ? (rdOf(rd0, Lq) / rd0) ** 2 : 1) * (nbY > 1 && cls === 0 ? Math.pow(nbY, (p || q).s.schoolExp ?? F3.SCHOOL_EXP) / nbY : 1);
          w = att * csOf(ps, cls, r) * (nbY > 1 ? (cls === 1 ? Math.pow(nbY, F3.BASS_SCH) : cls === 2 ? 0.15 : 1) : 1); }   // (its attacks: as larvae by their detectability, at their reaction distance; × the strike rule's capture success)
        else { const R = 1 / r, u = R / FRY.WIN_R * Math.exp(1 - R / FRY.WIN_R); w = Math.pow(u, FRY.WIN_E) * S3[KEYS3[k]].sp.vuln; }
      }
      if (FRY.LARV2) { if (larv && Lq <= FRY.LARVA_L) wL = larvW(ps, L, Lq); }
      else if (larv && w < FRY.LARV_A && Lq <= FRY.LARVA_L && Lq <= L / 3) wL = FRY.LARV_A * clamp(0.2 + 0.8 * (Lq - FRY.DETECT_L[0]) / (FRY.DETECT_L[1] - FRY.DETECT_L[0]), 0.2, 1);
      const aW = Math.max(aP * w, aL * wL) * acc; if (!(aW > 0)) continue;   // (the piscivore's window on its volume, the larvae on the picker's clearance)
      const aD = aW * av / V; A[j] = aD; sA += aD; sAH += aD * (T.sW[b0 + j] / av) / imax + (hS > 0 && aP * w >= aL * wL ? aP * att * acc * av / V * hS : 0);   // (F3.YWIN_CS: its attacks' time)
    }
    if (!(sA > 0)) return;
    let K = n * dt * sA / (1 + sAH), g = 0;
    for (let j = 0; j < NB; j++) if (A[j] > 0) g += K * A[j] / sA * T.sW[b0 + j] / T.av[b0 + j];
    if (g > gMax * n) { K *= gMax * n / g; g = gMax * n; }
    const bins = [], ks = [];
    const RQ = p ? T.req : T.reqY; for (let j = 0; j < NB; j++) if (A[j] > 0) { const kj = K * A[j] / sA; bins.push(b0 + j); ks.push(kj); RQ[b0 + j] += kj; }
    T.rec.push({ p, q, bins, ks });
    return g / n;   // (the grams a fish asked for: F3.STRIKE2's predators strike at the followed fish with the room left)
  }
  // THE SETTLEMENT (order-free within each kind): the followed fish first — each bin meets min(1, available / requested) of their
  // requests — then the young piscivores' schools from what is left (the GPU's order: its followed fish feed before the schools'
  // pass); a followed fish's share into its gut (as much as it has room for now), a school's into its bank for its next tick; each
  // school of young in a bin loses its share of what was taken
  _ySettle() {
    const T = this._yt; if (!T || !T.rec.length) return;
    for (const young of [false, true]) for (const r of (young && T.gotF.set(T.got), T.rec)) {   // (the schools share what the followed fish left: gotF)
      if (!!r.q !== young) continue;
      let g = 0, J = 0; const f = [];
      for (let m = 0; m < r.bins.length; m++) {
        const b = r.bins[m], left = young ? T.av[b] - T.gotF[b] : T.av[b], rq = young ? T.reqY[b] : T.req[b];
        const ff = left > 0 ? Math.min(1, left / rq) : 0, k = r.ks[m] * ff, Wq = T.sW[b] / T.av[b]; f.push(k); g += k * Wq; J += k * Wq * energyDensity(S3[KEYS3[((b / (FRY.NS * (T.nd || 1))) | 0) % KEYS3.length]].sp.bio, Wq);
      }
      if (!(g > 0)) continue;
      let s = 1;
      if (r.p) {   // a followed fish: its gut now (its room — what it has eaten since its request)
        const a = r.p; if (!a.alive) continue; const room = a.s.sp.gut * a.W - a.gut; s = room > 0 ? Math.min(1, room * a.n / g) : 0; if (!(s > 0)) continue;
        a.gut += g * s / a.n; a.gutE += J * s / a.n; a._ate = true; this.stats.food.yoy += g * s;
      } else { const q = r.q; if (!q.alive) continue; q.bankG += g; q.bankJ += J; this.stats.food.yYoy += g; }
      for (let m = 0; m < r.bins.length; m++) T.got[r.bins[m]] += f[m] * s;
    }
    for (const q of this.yoy) {
      if (q._ya > 0 && T.got[q._yb] > 0) { const d = Math.min(q.n, q._ya / T.av[q._yb] * T.got[q._yb]); q.n -= d; if (q.dev < 2) this.stats.eggs3[q.s.key].pred += d; else this.stats.fry[q.s.key].eaten += d; if (q.n < 1) q.alive = false; }   // (E3b: a prolarva eaten is the egg stage's)
    }
    T.rec.length = 0; T.req.fill(0); T.reqY.fill(0); T.got.fill(0);
  }
  // the nearest school of young within R of (x, y, z) that `ok` accepts (the hash of this step's start)
  _nearYoy(x, y, z, R, ok) {
    const Y = this._yoyList; if (!Y || !Y.length) return null;
    const S = this.yStart, I = this.yItems, R2 = R * R; let best = null, bd = R2;
    const gx0 = clamp(((x - R - GEO.X0) / F3.HC) | 0, 0, this.GHX - 1), gx1 = clamp(((x + R - GEO.X0) / F3.HC) | 0, 0, this.GHX - 1);
    const gy0 = clamp(((y - R - GEO.Y0) / F3.HC) | 0, 0, this.GHY - 1), gy1 = clamp(((y + R - GEO.Y0) / F3.HC) | 0, 0, this.GHY - 1);
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const c = gy * this.GHX + gx;
      for (let k = S[c]; k < S[c + 1]; k++) {
        const q = Y[I[k]]; if (!q.alive) continue;
        const d2 = (q.x - x) ** 2 + (q.y - y) ** 2 + (q.z - z) ** 2; if (d2 < bd && ok(q)) { bd = d2; best = q; }
      }
    }
    this._nyd = Math.sqrt(bd);
    return best;
  }
  // a fish eats from a school of young: a PISCIVORE works a school of young fish in its strike arena — a feeding bout of
  // FRY.ATTACK × TS fish a second × its capture success (fewer from a thinned school, FRY.N_HALF), gape-limited (the size
  // refuge); a plankton eater picks at larvae it fits (≤ ⅓ its length) at FRY.CATCH per handling slot. A school of eaters
  // eats n times as much; a guarded brood is hard to take (BROOD.PROTECT). Returns grams per fish eaten (_preyED set)
  _eatYoy(a, room, perf, dt) {
    if (!this._yoyList || !this._yoyList.length) return 0;
    const s = a.s, sp = s.sp, pisc = s.pisc && a.L >= sp.Lpisc, larv = !pisc || a.L < 3 * sp.Lpisc;
    const R0 = F3.YOY_EAT_R + a.L / 100, Ra = pisc ? Math.max(R0, s.strikeR * 1.5) : R0;
    const ok = q => q.guard !== a.id && ((pisc && q.bdep <= a.gape && q.L >= FEED.SCHOOL_MIN * a.L && q.L <= a.s.preyLR * a.L) || (larv && q.L <= FRY.LARVA_L && q.L <= a.L / 3));
    const q = this._nearYoy(a.x, a.y, a.z, Ra, ok); if (!q) return 0;
    const d = this._nyd, asPisc = pisc && q.bdep <= a.gape && q.L >= FEED.SCHOOL_MIN * a.L && q.L <= a.s.preyLR * a.L;
    const dens = q.n / (q.n + FRY.N_HALF) * (1 - q.cover);
    const sz = asPisc ? Math.pow(Math.max(0, 1 - q.bdep / a.gape), FEED.SIZE_SEL) : 1, close = asPisc && Ra > R0 ? clamp((Ra - d) / (Ra - R0), 0, 1) : 1;
    const mean = (asPisc ? FRY.ATTACK * TS * sp.capture * q.s.sp.vuln * sz * dens * close * perf * dt : FRY.CATCH * TS * (dt / FEED.HANDLE) * dens * perf) * a.n;
    let k = Math.min(Math.floor(q.n), Math.floor(room * a.n / q.W), poissonish(mean));
    if (k < 1) return 0;
    if (q.gref && q.gref.alive && q.gref.nt > 0 && Math.hypot(q.gref.x - q.nx, q.gref.y - q.ny) < F3.GUARD_R * 1.5 && rand() < BROOD.PROTECT) return 0;
    q.n -= k; this.stats.fry[q.s.key].eaten += k;
    if (q.n < 1) q.alive = false;
    this._preyED = energyDensity(q.s.sp.bio, q.W);
    return k * q.W / a.n;
  }
  // THE YOUNG-OF-YEAR SCHOOLS (world.js _stepFry, in 3-D): each moves toward its target at its own pace (it lives on the
  // physiological clock), held near its nest while the guardian keeps it; every YOY_TICK it feeds (_feedYoy), dies by its
  // larval and juvenile mortality, starvation, heat and hypoxia, picks its next target and, grown, recruits
  // where a young school cruising about its feeding spot heads this step (see F3.YOY_CRUISE): its heading wanders and is turned
  // home as it nears YOY_ROAM from the spot, and away from water too far from the spot's depth (or out of the brook, for the
  // brook's own); slower at night, nearly still in the cold. A coarse block: somewhere about the spot (its wander over the block)
  _yoyCruise(q, mv) {
    const out = this._yc || (this._yc = [0, 0]), e = this.env, T = q.j >= 0 ? e.temp[q.j] : 15;
    const inB = GEO.bodyAt(q.x, q.y) === BROOK;   // (the lakes' young don't cruise into the brook; the brook's own don't leave it)
    const ok = (x, y) => { const b = GEO.bodyAt(x, y), bed = GEO.depthAt(x, y); return b !== LAND && bed > 0.12 && e.colAt(x, y) >= 0 && Math.abs(bed - q.spotBed) < F3.YOY_DBED && (!q.s.brookRes || b === BROOK) && (q.s.brookYoy || inB || b !== BROOK); };
    if (Math.abs(q.bed - q.spotBed) >= F3.YOY_DBED) { out[0] = q.tx; out[1] = q.ty; return out; }   // (off its spot's water: back to the spot)
    if (q.s.brookRes && GEO.bodyAt(q.x, q.y) !== BROOK) { const p = BP[nearestBP(q.x, q.y)]; out[0] = p[0]; out[1] = p[1]; return out; }   // (the brook's own: back into it)
    if (mv > F3.FINE_MAX) {
      for (let t = 0; t < 4; t++) { const r = F3.YOY_ROAM * Math.sqrt(rand()), a = rand() * Math.PI * 2, x = q.tx + r * Math.cos(a), y = q.ty + r * Math.sin(a); if (ok(x, y)) { out[0] = x; out[1] = y; return out; } }
      out[0] = q.x; out[1] = q.y; return out;
    }
    const act = (e.sun < 0.05 ? 0.3 : 1) * clamp((T - 4) / 8, 0.05, 1), step = Math.min(F3.YOY_VMAX, F3.YOY_CRUISE * q.L / 100) * act * mv;
    q.hd += (rand() - 0.5) * 2 * F3.YOY_TURN * Math.sqrt(mv);
    const ox = q.x - q.tx, oy = q.y - q.ty, pull = (Math.hypot(ox, oy) / F3.YOY_ROAM) ** 2;
    if (pull > 0.05) q.hd += angDiff(Math.atan2(-oy, -ox), q.hd) * Math.min(1, pull * mv);
    let x = q.x + Math.cos(q.hd) * step, y = q.y + Math.sin(q.hd) * step;
    if (!ok(x, y)) { q.hd += Math.PI * (0.5 + rand()); x = q.x; y = q.y; }   // (turn away: the shore, the wrong depth, the brook's end)
    out[0] = x; out[1] = y; return out;
  }
  _stepYoy(dt, mv, yf) {
    const Y = this.yoy; if (!Y.length) return;
    const juvD = this._juvDens();
    for (const q of Y) if (q.alive) this._yoyLive(q, dt, mv, yf, juvD);
  }
  // (E3) THE EGGS AND THE YOLK-SAC LARVAE ON THE BED (config EGG3): they develop on the water's temperature at the bed — dev 0 → 1 the
  // egg, 1 → 2 the yolk — and die by cause; a guard deserts in the cold; at dev 2 the school swims up (at Lhatch, as before)
  _eggLive(q, dt) {
    const e = this.env, E = EGG3, P = E.sp[q.s.key], k = q.s.key; if (!P) { q.dev = 2; return; }
    const c = e.colAt(q.x, q.y); if (c < 0) { q.alive = false; return; }
    const j = e.cellAt(q.x, q.y, q.z); q.c = c; q.j = j; q.jb = this.bedCell(c, q.bed); q.age += dt;
    const T = e.temp[j], o2 = this.chem.o2[j] * ENV.O2_MGL, d = dt / DAY; q.eggTm += (T - q.eggTm) * -Math.expm1(-d);   // (the day's running mean: not the night's dip)
    if (q.age < DAY) q.eggT0 = q.eggTm;   // (the laying temperature: the first day's mean, not the afternoon it was laid in)
    const Tm = q.eggTm; if (P.guard && q.gref && q.gref.alive && q.gref.nt > 0 && (Tm <= E.DESERT_T || (P.desertDrop && Tm <= q.eggT0 - E.DESERT_DROP))) { q.gref.nt = 0; this.stats.eggs3[k].leftCold = (this.stats.eggs3[k].leftCold || 0) + 1; }   // (deserted in the cold)
    const guarded = q.gref && q.gref.alive && q.gref.nt > 0; if (!guarded) { if (q.gref) { const t = this.stats.eggs3[k], w = q.gref.alive ? "leftThin" : "guardDied"; t[w] = (t[w] || 0) + 1; } q.gref = null; q.guard = 0; }
    else if (q.gref.nt < 2 * dt) q.gref.nt = 2 * dt;   // (a guard keeps its brood through hatching and the yolk — to swim-up; its nestGuard time is the fry's after)
    const egg = q.dev < 1, rate = egg ? eggRate3(P, T) : yolkRate3(P, T);   // (development a day)
    const hB = -Math.log(egg ? P.hatch : P.yolkHatch ?? E.YOLK_HATCH) * rate, hT = E.THERM_K * (Math.max(0, (egg ? P.tl[0] : P.ytl0 ?? P.tl[0]) - Tm) + Math.max(0, Tm - P.tl[1]));   // (E3b ytl0: the yolk-sac's own cold limit)
    const hG = P.guard && q.hadGuard && !guarded ? E.UNGUARDED : 0, hP = egg && P.pred > 0 ? -Math.log(1 - P.pred) * rate : 0;
    const hO = o2 < P.o2 ? E.O2_K * (1 - o2 / P.o2) : 0, hS = e.weather === 3 && q.bed < E.STORM_Z ? E.STORM_D : 0, h = hB + hT + hG + hP + hO + hS;
    const lost = q.n * -Math.expm1(-h * d);
    if (lost > 0) { const t = this.stats.eggs3[k], f = lost / h; t.base += hB * f; t.temp += hT * f; t.guard += hG * f; t.pred += hP * f; t.o2 += hO * f; t.storm += hS * f; this.chem.addSedOM(q.jb, lost * q.W); q.n -= lost; }
    q.dev += rate * d;
    if (q.n < 1) { q.alive = false; return; }
    if (q.dev >= 2) { q.dev = 2; this.stats.fry[k].hatched += q.n; this.stats.eggs3[k].swum += q.n; }   // (swim-up: the young's fates count from here)
  }
  // the young's density per lake m² by species (their juvenile mortality's compensation)
  _juvDens() {
    const juvD = this._juvD || (this._juvD = new Float64Array(KEYS3.length)); juvD.fill(0);
    for (const q of this.yoy) if (q.alive && q.dev >= 2) juvD[q.k] += q.n * (1 - Math.exp(-((q.L / FRY.LARVA_L) ** 2))) / this.lakeM2;
    if (this.shard) { this.juvOwn = Float64Array.from(juvD); if (this.juvOther) for (let k = 0; k < juvD.length; k++) juvD[k] += this.juvOther[k]; }   // (SHARDS: the lakes' young, the others' too)
    return juvD;
  }
  // ONE SCHOOL OF YOUNG'S STEP: dt s of its life (mv of its swimming: a coarse block's cruise when mv > FINE_MAX)
  _yoyLive(q, dt, mv, yf, juvD) {
    if (q.dev < 2) return this._eggLive(q, dt);   // (E3: on the bed until swim-up)
    const e = this.env, ch = this.chem, G = this.G, s = q.s, sp = s.sp;
    q.age += dt; q.tk += dt;
    const held = q.gref && q.gref.alive && q.gref.nt > 0;
    if (!held) { q.gref = null; q.guard = 0; }
    // move toward the target (a guarded brood within GUARD_R of its nest) — or, about its feeding spot, cruise
    let tx = q.tx, ty = q.ty; if (held) { tx = clamp(tx, q.nx - F3.GUARD_R, q.nx + F3.GUARD_R); ty = clamp(ty, q.ny - F3.GUARD_R, q.ny + F3.GUARD_R); }
    else if (Math.hypot(q.x - q.tx, q.y - q.ty) < F3.YOY_ROAM) [tx, ty] = this._yoyCruise(q, mv);
    // (across and up or down at once: the vertical target clamped to the water here — a depth below this bed must not hold the
    // school still, as it did when one 3-D step was shared between them)
    const v = Math.min(F3.YOY_VMAX, F3.YOY_BL * q.L / 100) * mv, dx = tx - q.x, dy = ty - q.y, dh = Math.hypot(dx, dy);
    if (dh > 1e-4) {
      const k = Math.min(1, v / dh), nx = q.x + dx * k, ny = q.y + dy * k, bed = GEO.depthAt(nx, ny);
      if (GEO.bodyAt(nx, ny) !== LAND && bed > 0.12 && this.env.colAt(nx, ny) >= 0) { q.x = nx; q.y = ny; q.bed = bed; } else { q.tx = q.x; q.ty = q.y; }
    }
    const zT = clamp(q.tz, 0.05, Math.max(0.06, q.bed - 0.02)), dz = zT - q.z;
    q.z = clamp(q.z + Math.sign(dz) * Math.min(Math.abs(dz), v), 0.05, Math.max(0.06, q.bed - 0.02));
    if (this.shard && this.shard.owner[e.colAt(q.x, q.y)] !== this.shard.me) { q._out = true; return; }   // (SHARDS: as the fish's)
    if (q.tk < F3.YOY_TICK) return;
    const st = q.tk; q.tk = 0;
    const c = q.c = e.colAt(q.x, q.y); if (c < 0) { q.alive = false; return; }
    const j = q.j = G.cell0[c] + Math.min(G.nL[c] - 1, Math.max(0, (q.z / G.DZ) | 0)); q.jb = this.bedCell(c, q.bed);
    const T = e.temp[j], o2 = ch.o2[j];
    q.cover = Math.max(F3.SHALLOW_REFUGE * clamp((0.8 - q.bed) / 0.6, 0, 1), this._inWeeds(q, c, false), this._riffle(q));
    const hF = this._feedYoy(q, st, T);
    // THE FIRST WINTER (config WINTER0): past the autumn the ramp's share of the school this tick takes the place of its starvation
    const fW = winterF(s.key, q.L, q.age, yf, st), hS = fW >= 0 ? (fW >= 1 ? 50 / st : -Math.log1p(-fW) / st) : hF;   // (not this spring's larvae)
    ch.o2[j] = Math.max(0, ch.o2[j] - q.rO2 * st / (G.vol[j] * ENV.O2_MGL));
    // MORTALITY (world.js): the larval critical period (∝ 1/length, fading by ~3 cm), then the juveniles' predation with
    // its density compensation (FRY.JUV_*), both slower in cold water; the species' size-scaled M; starvation; heat; hypoxia
    const o2L = lethalO2(sp.o2Lethal / ENV.O2_MGL, (sp.o2Ice ?? 0) / ENV.O2_MGL, T), lf = Math.exp(-((q.L / FRY.LARVA_L) ** 2));
    // (FRY.CYC) the cyclopoid copepods on the smallest larvae (natural deaths, by the copepod field where the school is)
    const hCy = FRY.CYC && q.L < FRY.CYC_L[1] ? FRY.CYC_K * ch.zooC[j] * PLANKTON.UGL * (1 - naupShare(yf)) * FRY.CYC_SHARE / FRY.CYC_W * clamp((FRY.CYC_L[1] - q.L) / (FRY.CYC_L[1] - FRY.CYC_L[0]), 0, 1) * (s.cycRob ?? FRY.CYC_ROB) * Math.min(1, Math.pow(2, (T - 20) / 10)) / DAY : 0;
    const hN = hCy + (FRY.M_LARVA3 / Math.max(0.3, q.L) * lf + FRY.M_JUV3 * (1 - lf) * (juvD[q.k] + FRY.JUV_D50) / (FRY.JUV_DREF + FRY.JUV_D50) * Math.min(FRY.M_JUV_CLAMP[1], Math.max(FRY.M_JUV_CLAMP[0], Math.pow(q.L / FRY.M_JUV_L, -FRY.M_JUV_B)))) * Math.min(1, Math.pow(FRY.M_JUV_Q10, (T - 20) / 10)) / DAY
      + sp.M * BIOE.M_OTHER * Math.min(F3.YM_CAP, Math.pow(q.L / sp.Lref, -0.87)) * (F3.YM_COLD ? Math.min(1, Math.pow(FRY.M_JUV_Q10, (T - 20) / 10)) : 1) / YEAR;
    const ul = s.uiltY ?? sp.uilt, hH = T > ul - 2 ? LN2 / (BIOE.UILT_DAYS * DAY) * Math.exp((T - ul) / BIOE.HEAT_STEEP) : 0;   // (S3 uiltY: a young of its own limit)
    const hO = o2 < o2L ? LN2 / (BIOE.HYPOXIA_DAYS * DAY) * Math.exp(BIOE.HYPOXIA_STEEP * (o2L - o2) / o2L) : 0;
    const HWy = this._wHy || (this._wHy = new Float64Array(WILDK.length)), hWd = F3.WILD ? this._wildH(s.key, q.L, q.z, q.bed, q.cover, this.env.ice[c], HWy) : 0;   // (E4: the wildlife)
    const hA = s.run && ALEWIFE.ON ? this._aleYoung(q, T, c, yf, this._aleH || (this._aleH = [0, 0])) : null, hE = hA ? hA[0] : 0, hC = hA ? hA[1] : 0;   // (E8: the young alewives' emigration and cold)
    const h = hN + hS + hH + hO + hWd + hE + hC, lost = q.n * (1 - Math.exp(-h * st));
    if (h > 0) { const fr = this.stats.fry[s.key]; fr.natural += lost * hN / h; fr.starve += lost * hS / h; fr.heat += lost * hH / h; fr.hypoxia += lost * hO / h; if (hWd > 0) { fr.wild = (fr.wild || 0) + lost * hWd / h; this._wildTally(s.key, HWy, h, lost, q.W); }
      if (hE > 0) { const x = lost * hE / h; fr.emig = (fr.emig || 0) + x; this.stats.ale.yOut += x; this._aleNutr(j, q.jb, -x * q.W * ALEWIFE.YOUNG_P, -x * q.W * ALEWIFE.YOUNG_N, false); }   // (the emigrants' N and P leave with them)
      if (hC > 0) { const x = lost * hC / h; fr.cold = (fr.cold || 0) + x; this.stats.ale.yCold += x; } }
    this.chem.addSedOM(q.jb, lost * q.W * (h > 0 ? 1 - (hWd + hE) / h : 1));   // (the wildlife's take and the emigrants leave the lake)
    q.n -= lost;
    if (q.n < 1) { if (rand() < q.n) q.n = 1; else { q.alive = false; return; } }
    // NEXT TARGET: up out of low O₂, down out of heat; else the food these fish eat about them
    this._yoyTarget(q, o2, T);
    if (q.s.brookRes && GEO.bodyAt(q.tx, q.ty) !== BROOK) { const p = BP[nearestBP(q.tx, q.ty)]; q.tx = p[0]; q.ty = p[1]; }   // (the brook's own young feed in the brook)
    q.spotBed = Math.max(0.12, GEO.depthAt(q.tx, q.ty));   // (its cruise keeps to water like its spot's)
    // RECRUITMENT: at the species' L0, or an overwintered school in spring (F3.RECRUIT_SPRING: only in spring — the year's young one rule all year)
    if (!s.noRecruit && ((!F3.RECRUIT_SPRING && q.L >= sp.L0) || (q.age > FRY.OVERWINTER * YEAR && yf >= (F3.RECRUIT_WARM ? winterWindow[1] : FRY.SPRING_YF) && yf < SPAWN.SEASON_END))) this._recruit(q);   // (S3 noRecruit: the alewives' young never do)
  }
  // THE YOUNG BY DISTANCE (as the fish, _stepMixed): the schools within the focus live this fine step; the rest are scheduled
  // FAR_BLOCK blocks (a block's cruise about their spot, their feeding tick over the block). Their density and the region about the
  // focus come once a simulated second, as does their hash (a far school does not move between its blocks)
  _stepYoyMixed(dt, mv, yf, full) {
    const Y = this.yoy, fo = this.focus, NB = this._nb, rIn2 = fo.r * fo.r, rOut2 = rIn2 * F3.FOCUS_HYST * F3.FOCUS_HYST;
    if (!this._yMixOn || this._ynb !== NB) {   // (a run with a focus starts: each school's near flag, the far ones' schedule)
      this._yMixOn = true; this._ynb = NB; this._ybk = Array.from({ length: NB }, () => []);
      for (const q of Y) {
        if (!q.alive) continue; q.near = (q.x - fo.x) ** 2 + (q.y - fo.y) ** 2 < rIn2;
        if (q.near) { q._t0 = this.time; q._due = -1; } else { const st = (q.id * 0.6180339887) % 1; q._t0 = this.time - st * F3.FAR_BLOCK; this._ysched(q, Math.max(1, Math.round((1 - st) * NB))); }
      }
      full = true;
    }
    if (full || !this._yRegion) {
      this._juvDens();
      const R = Math.sqrt(rOut2) + F3.REGION_M, R2 = R * R; this._yRegion = Y.filter(q => q.alive && (q.x - fo.x) ** 2 + (q.y - fo.y) ** 2 < R2);
    }
    const juvD = this._juvD;
    for (const q of this._yRegion) {
      if (!q.alive) continue;
      const wasNear = q.near, near = q.near = (q.x - fo.x) ** 2 + (q.y - fo.y) ** 2 < (wasNear ? rOut2 : rIn2);
      if (!near) { if (wasNear) { q._t0 = this.time; this._ysched(q, NB); } continue; }
      if (!wasNear) { q._due = -1; const d = this.time - q._t0; if (d > 1.5 * dt) { q._t0 = this.time; this._yoyLive(q, d, d, yf, juvD); continue; } }
      this._yoyLive(q, dt, mv, yf, juvD); q._t0 = this.time;
    }
    const slot = this.stepNo % NB, due = this._ybk[slot]; this._ybk[slot] = [];
    for (const q of due) {
      if (!q.alive || q.near) continue;   // (lazy: a school that came near or died)
      if (q._due !== this.stepNo) { if (q._due > this.stepNo && q._due % NB === slot) this._ybk[slot].push(q); continue; }
      const d = this.time - q._t0; q._t0 = this.time; this._ysched(q, NB);
      this._yoyLive(q, d, d, yf, juvD);
    }
  }
  _ysched(q, steps) { const t = this.stepNo + steps; q._due = t; this._ybk[t % this._ynb].push(q); }
  // where a school of young goes next: the richest food of its stage about it (its column and the next ones) — weighed by the
  // spot's cover for a species whose young keep to it (S3 yCover: the weeds' stems, very shallow water)
  _yoyTarget(q, o2, T) {
    const s = q.s, sp = s.sp, d = sp.diet, G = this.G, ch = this.chem, c = q.c, yc = s.yCover || 0, pl = this.env.plants;
    const cov = cc => yc > 0 ? 1 - yc + yc * Math.max(F3.SHALLOW_REFUGE * clamp((0.8 - G.depthMean[cc]) / 0.6, 0, 1), pl ? pl.standCover(this.colBedJ[cc]) : 0) : 1;   // (the stands of the bed it would hold to there)
    // THE LAKES' YOUNG DON'T RAISE IN THE BROOK: a stream fish's young (dace, fallfish — S3 brookYoy) live in it; the others'
    // drift down it into Lower (sucker larvae leave their spawning stream for the lake) and never choose it to feed in. (At 1/10
    // the brook was the richest bed near a large share of the lakes' young: young bass, perch, suckers, bullheads and white perch
    // took 85–95 % of its insects in July and August and its dace starved)
    // (S3 yBed: a littoral spawner's young keep to its shelf — the water no deeper than yBed m; the killifish's followed zooplankton
    // offshore over 3–3.6 m and stalled at ~2 cm, where real young grow to 2.6–3.2 cm in the weedy shallows by September) — in the
    // open-water season only (≥ YBED_T °C): killifish move into the lakes' deeper parts in late fall and winter (COSEWIC 2003, Godin)
    const free = GEO.SCALE >= 1, inB = G.body[c] === BROOK, yB = T >= F3.YBED_T ? s.yBed || 0 : 0, ok = cc => (s.brookYoy || free || G.body[cc] !== BROOK) && !(yB > 0 && G.depthMean[cc] > yB);   // (true scale: the brook is its real share again — the young may feed in it)
    if (inB && !s.brookYoy && !free) { const k = nearestBP(q.x, q.y), p = k >= BLAST ? LAKE_NEAR[LOWER] : BP[k + 1]; q.tx = p[0]; q.ty = p[1]; q.tz = Math.max(0.05, q.z); return; }
    const o2m = sp.o2Crit + (T < F3.YO2_T ? F3.YO2_MARGIN / ENV.O2_MGL : 0);   // (F3.YO2_MARGIN mg/L: the water they choose in cold water, with room to spare)
    if (o2 < o2m) { const bc = this._o2Better(c); if (bc >= 0) { q.tx = G.cx[bc]; q.ty = G.cy[bc]; } else { q.tx = q.x; q.ty = q.y; } q.tz = Math.max(0.05, q.z - 1); return; }   // (up, and across to better water)
    if (T > sp.uilt - 3) { q.tx = q.x; q.ty = q.y; q.tz = q.bed - 0.05; return; }
    const benth = q.L >= (sp.benthL ?? FRY.BENTH_L) && (d.larva || d.snail || d.detritus), nb = this.nbr[c];
    if (benth) {   // young bottom foragers live on the bed (Werner & Hall 1988): the richest bed about them with O₂
      let best = -Infinity, bc = -1;
      const lit = this.env.lit;
      const tryC = cc => { const jb = this.colBedJ[cc]; if (jb < 0 || ch.o2[jb] < o2m || !ok(cc)) return; const E = ch.benth[jb] / A2 - BENTHOS.REFUGE + (lit ? lit.weedEyoy(jb, q.L) : 0); if (!(E > BENTHOS.SENSE_MIN)) return; const V = E * cov(cc); if (V > best) { best = V; bc = cc; } };
      tryC(c); for (let k = 0; k < nb.length; k++) tryC(nb[k]);
      if (bc >= 0) { if (bc !== c) { q.tx = G.cx[bc]; q.ty = G.cy[bc]; } q.tz = Math.max(0.05, (bc === c ? q.bed : G.depthMean[bc]) - 0.05); return; }
    }
    // zooplankton of a larva's size (rotifers and nauplii while small; the limnetic phase over open water for sunfish fry)
    const zc = this._ytc || (this._ytc = new Float64Array(4)), zu = this._ytu || (this._ytu = new Float64Array(4)); yZoo(q.L, this.env.yearFrac(), zc, zu, q.s.zooLadderK ?? 1);
    const pel = sp.pelagicFry && q.L < sp.pelagicFry && !q.gref;
    let best = -1, bj = -1; const k0 = Math.min(G.nL[c] - 1, Math.max(0, (q.z / G.DZ) | 0));
    const tryJ = jj => { const cc = G.colOfCell[jj]; if ((pel && (G.depthMax[cc] < 2 || G.zMid[jj] > 1.5)) || !ok(cc) || (F3.YO2_MARGIN > 0 && ch.o2[jj] < o2m)) return; const E = ch.zooElY(jj, zu) * cov(cc); if (E > best) { best = E; bj = jj; } };
    for (let k = 0; k < G.nL[c]; k++) tryJ(G.cell0[c] + k);
    for (let k = 0; k < nb.length; k++) { const cc = nb[k]; tryJ(G.cell0[cc] + Math.min(G.nL[cc] - 1, k0)); }
    if (bj >= 0) { const cc = G.colOfCell[bj]; if (cc !== c) { q.tx = G.cx[cc] + (rand() - 0.5) * 30 * GEO.SCALE; q.ty = G.cy[cc] + (rand() - 0.5) * 30 * GEO.SCALE; } q.tz = G.zMid[bj];
      if (yc > 0 && pl && pl._canopy[cc] > 0.1) q.tz = Math.max(0.05, Math.max(q.tz, G.depthMean[cc] - 0.5 * pl._canopy[cc]));   // (a cover keeper's young hold IN the weeds — pickerel fry cling to the stems, the fingerlings live in them)
      return; }
    // (S3 yBed: off its shelf with no shelf water about — back toward the shore, to the shallowest column about it. The wander below
    // ignored the shelf: only ~2 % of the 50-m columns average ≤ 0.5 m, so a killifish school beside none of them wandered out over
    // 2–3 m and never found its way back — killi.mjs, 1/10 CPU: the young's bed 1.7–2.8 m all summer, against yBed 0.5)
    if (yB > 0) { let sc = c; for (let k = 0; k < nb.length; k++) if (G.depthMean[nb[k]] < G.depthMean[sc]) sc = nb[k]; if (sc !== c) { q.tx = G.cx[sc]; q.ty = G.cy[sc]; } else { q.tx = q.x; q.ty = q.y; } return; }
    q.tx = q.x + (rand() - 0.5) * 60 * GEO.SCALE; q.ty = q.y + (rand() - 0.5) * 60 * GEO.SCALE;   // nothing about: wander
  }
  // a school's feeding over st at T (world.js _feedFry): young piscivores on other young, zooplankton of their size (type II in
  // K_FRY), the bed's worms and scuds past benthL, the organic layer for the bottom-sifters; then one fish's energy budget on
  // its share — SCRAMBLE: when what it found can't keep every fish at maintenance, the rest starve as their reserves run out.
  // Returns the starvation hazard (/s)
  _feedYoy(q, st, T) {
    const s = q.s, sp = s.sp, d = sp.diet, ch = this.chem, b = sp.bioJuv || sp.bio, dd = st / DAY, P = PLANKTON;
    const yw = F3.YW_T0 > 0 && q.age > F3.YW_AGE * DAY ? clamp((T - F3.YW_T0) / (F3.YW_T1 - F3.YW_T0), 0, 1) : 1;   // (F3.YW_T0: the winter's fast)
    const want = yw * q.n * coldCmax(sp.cold, b, sp.bio, q.W, T) * q.W * dd * (1 + ((s.cmaxL ?? FRY.CMAX_LARVA) - 1) * clamp((FRY.LARVA_CM[1] - q.L) / (FRY.LARVA_CM[1] - FRY.LARVA_CM[0]), 0, 1));   // (S3 cmaxL: its own larvae's)
    let got = 0, J = 0;
    if (FRY.DENSITY && q.bankG > 0) { const g = Math.min(q.bankG, want), f = g / q.bankG; got += g; J += q.bankJ * f; q.bankG -= g; q.bankJ -= q.bankJ * f; }   // (stage Y1: the young fish it caught last tick)
    if (FRY.DENSITY && d.fish && q.L >= (sp.yLpisc ?? sp.Lpisc)) this._yReq(null, q, q.c, q.n, q.L, q.L * sp.gapeR, want / Math.max(1, q.n * st), st, Math.max(0, want / q.n - q.bankG / q.n), true, false, F3.YCOLD ? Math.min(coldPerf(T, sp.tempOpt, sp.coldPerf), consumptionTrel(sp.bioJuv || sp.bio, T)) : coldPerf(T, sp.tempOpt, sp.coldPerf), s.preyLR);
    else if (d.fish && q.L >= (sp.yLpisc ?? sp.Lpisc)) {   // young piscivores eat other young they can swallow (from the species' yLpisc)
      const r = this._nearYoy(q.x, q.y, q.z, F3.YOY_EAT_R, o => o !== q && o.L * o.s.sp.depthR <= q.L * sp.gapeR && o.L >= FEED.SCHOOL_MIN * q.L);
      if (r) {
        const k = Math.min(r.n, (want - got) / r.W, q.n * FRY.ATTACK * TS * sp.capture * r.s.sp.vuln * r.n / (r.n + FRY.N_HALF) * (1 - r.cover) * st);
        if (k > 0) { r.n -= k; if (r.n < 1) r.alive = false; this.stats.fry[r.s.key].eaten += k; got += k * r.W; J += k * r.W * energyDensity(r.s.sp.bio, r.W); this.stats.food.yYoy += k * r.W; }
      }
    }
    // (F3.YSHARE: rate the zooplankton, the weeds' fauna and the bed first; each then asked for base × its time share — its own response
    // applied by its take, as before)
    const lit = this.env.lit, benthL = sp.benthL ?? FRY.BENTH_L, base = want - got;
    const canZ = d.plankton || q.L < sp.Lzoo, canW = !!lit && (d.larva || d.insect) && q.L >= LIT3.WEED_L && q.bed - q.z <= F3.BENTH_REACH + this.env.plants._canopy[q.c];
    const canB = q.L >= benthL && (d.larva || d.snail || d.detritus) && q.bed - q.z <= F3.BENTH_REACH;
    const nbY = this.nbr[q.c], BL = this._ybl || (this._ybl = new Int32Array(64)); let nB = 0;
    if (canB) { if (q.jb >= 0) BL[nB++] = q.jb; for (let i = 0; i < nbY.length && nB < BL.length; i++) { const jb = this.colBedJ[nbY[i]]; if (jb >= 0) BL[nB++] = jb; } }
    let tZ = 1, tW = 1, tB = 1;
    const zc = this._yfc || (this._yfc = new Float64Array(4)), zu = this._yfu || (this._yfu = new Float64Array(4)); if (canZ) yZoo(q.L, this.env.yearFrac(), zc, zu, q.s.zooLadderK ?? 1);   // (E2c/E2d: its zooplankton ladder)
    if (F3.YSHARE && base > 1e-12) {
      let fZ = 0, fW = 0, fB = 0;
      if (canZ) { const YL = this._ylyshare || (this._ylyshare = new Int32Array(64)); const G = this.G, c = q.c, j0 = G.cell0[c], k0 = q.j - j0; let nY = 0;
        for (let k = Math.max(0, k0 - 1); k <= Math.min(G.nL[c] - 1, k0 + 1); k++) YL[nY++] = j0 + k;
        for (let i = 0; i < nbY.length && nY < YL.length; i++) { const cc = nbY[i]; YL[nY++] = G.cell0[cc] + Math.min(G.nL[cc] - 1, k0); }
        const X = ch.zooXyoy(YL, nY, zu); fZ = X / (1 + X); }
      if (canW) { const E = lit.weedEyoy(q.jb, q.L); fW = E > 0 ? E / (E + BENTHOS.K_FISH) : 0; }
      if (canB && nB) { const E = ch.benthEcells(BL, nB); fB = E > 0 ? E / (E + BENTHOS.K_FISH) : 0; }
      const Q = F3.SHARE_Q, qZ = fZ ** Q, qW = fW ** Q, qB = fB ** Q, sq = qZ + qW + qB;
      if (sq > 0) { tZ = qZ / sq; tW = qW / sq; tB = qB / sq; }
    }
    const ask = t => F3.YSHARE ? base * t : want - got;
    if (canZ && ask(tZ) > 1e-12) {
      // (its FOOTPRINT: the water about it it ranges in a tick — its own column (its layer ± one) and the ring of columns round it at
      // its layer: a school of young can't strip one cell and starve beside plenty; the adults' have theirs, _footprint)
      const G = this.G, c = q.c, j0 = G.cell0[c], k0 = q.j - j0, YL = this._yl || (this._yl = new Int32Array(64)), nb = this.nbr[c]; let nY = 0;
      for (let k = Math.max(0, k0 - 1); k <= Math.min(G.nL[c] - 1, k0 + 1); k++) YL[nY++] = j0 + k;
      for (let i = 0; i < nb.length && nY < YL.length; i++) { const cc = nb[i]; YL[nY++] = G.cell0[cc] + Math.min(G.nL[cc] - 1, k0); }
      const t = ch.zooFeedYoy(YL, nY, zc, zu, ask(tZ), this._zf || (this._zf = [0, 0, 0, 0])), g = t[0] + t[1] + t[2] + t[3];
      if (g > 0) { got += g; J += t[0] * PREY.DAPH_ED + t[1] * PREY.COPE_ED + t[2] * PREY.ROT_ED + t[3] * PREY.DAPH_ED; this.stats.food.yZoo += g; if (t[3] > 0) this.stats.food.yZooS = (this.stats.food.yZooS || 0) + t[3]; }
    }
    // the weeds' small fauna from WEED_L, their large from LARGE_L (stage 7b), for a school in the canopy or near the bed
    if (canW && ask(tW) > 1e-12) {
      const g = lit.takeYoy(q.jb, ask(tW), q.L, BENTHOS.K_FISH); if (g > 0) { got += g; J += lit.J; this.stats.food.yWeed += g; }
    }
    if (canB && ask(tB) > 1e-12) {
      // (the bed about it too: its own bed cell and its neighbours' mean-depth bed cells — BL, above)
      const g = ch.takeBenthCells(BL, nB, ask(tB), BENTHOS.K_FISH); if (g > 0) { got += g; J += g * PREY.BENTH_ED; this.stats.food.yBenth += g; }
    }
    if (q.L >= benthL && d.detritus && want - got > 1e-12 && q.bed - q.z <= F3.BENTH_REACH) {
      const g = ch.takeSedOM(q.jb, Math.min(want - got, FEED.POOR_GUT * q.n * sp.gut * q.W)); if (g > 0) { got += g; J += g * PREY.DETRITUS_ED * PREY.DETRITUS_DIG; this.stats.food.ySed += g; }
    }
    const p = want > 0 ? Math.min(1, got / want) : 0;
    wasteFractions(b, T, p, WF);
    const Wr = F3.RWMIN_STEEP && !(b.RB < -0.3) ? q.W : Math.max(q.W, FRY.R_WMIN), r = coldResp(sp.cold, b, sp.bio, Wr, T) * q.W, Rj = r * OXYCAL * dd;   // (F3.RWMIN_STEEP)
    const eff = (1 - WF[0]) * (1 - WF[1] - b.SDA), edF = got > 0 ? J / got : PREY.DAPH_ED;
    const need = Rj / Math.max(1e-9, eff * edF), ed = energyDensity(b, q.W);
    let hS = 0;
    q.rO2 = q.n * r / DAY;
    q.p += (p - q.p) * Math.min(1, dd);
    if (got >= q.n * need) {
      const C = J / q.n, F = WF[0] * C, U = WF[1] * (C - F), S = b.SDA * (C - F);
      q.W = Math.max(1e-7, q.W + (C - F - U - S - Rj) / ed);
      if (q.W > stdWeight(sp.lw, q.L)) { q.L = lengthFor(sp.lw, q.W); q.bdep = q.L * sp.depthR; }
    } else {
      const tStarve = 0.4 * ed / Math.max(1e-9, r * OXYCAL / q.W);
      hS = (1 - got / Math.max(1e-12, q.n * need)) / (tStarve * DAY);
    }
    return hS;
  }
  // RECRUITMENT: a school species' young become a school agent with a brain (their genome); a solitary species' young below their
  // size become groups of them (F3.AGENTS_HA: S3 group), past it individuals (siblings: fresh mutations of the school's genome) —
  // up to F3.CAP × the species' census
  _recruit(q) {
    q.alive = false;
    const s = q.s, sp = s.sp, k = s.key, room = Math.max(0, F3.CAP * this._target(s) - this.cnt[q.k] - (this.cntOther ? this.cntOther[q.k] : 0));   // (SHARDS: the lakes' fish, the others' too)
    const yrs = q.age / YEAR, born = [];
    if (s.school || (s.group && q.L < s.group[0])) {
      let left = Math.min(q.n, room), first = true; const gs = s.school ? Infinity : s.group[1];
      while (left >= 1) { const n = Math.min(left, gs), [x, y] = first ? [q.x, q.y] : this._near(q.x, q.y, 0.6); born.push(this.add(k, x, y, q.z, yrs, n, first ? q.g : mutate(q.g), first ? q.genes : mutateGenes(q.genes))); left -= n; first = false; }
    } else {
      const n = Math.min(Math.floor(q.n + rand()), Math.floor(room));
      for (let i = 0; i < n; i++) { const [x, y] = this._near(q.x, q.y, 0.6); born.push(this.add(k, x, y, q.z, yrs, 1, i ? mutate(q.g) : q.g, i ? mutateGenes(q.genes) : q.genes)); }
    }
    for (const a of born) {
      a.L = q.L; a.W = q.W; a.gen = q.gen; a.hue = q.hue; a.mature = false; a.gon = 0; a.mateCd = 0; this._settle(a);
      a.bed = Math.max(0.05, GEO.depthAt(a.x, a.y)); a.z = clamp(q.z, F3.ZTOP, Math.max(F3.ZTOP, a.bed - F3.ZBOT)); a._pz = a.z;
      this.cnt[a.k] += a.n; this.stats.recruits[k] += a.n; this.stats.fry[k].recruited += a.n;
    }
    let tot = 0; for (const a of born) tot += a.n; this.stats.fry[k].capped += Math.max(0, q.n - tot);   // (the school's fish the census had no room for)
  }
  // schools of young of a species and size meet and merge (one genome, chosen ∝ n) — never a guarded brood
  _mergeYoy() {
    const Y = this._yoyList; if (!Y || Y.length < 2) return;
    const S = this.yStart, I = this.yItems, R2 = F3.YOY_MERGE_R ** 2;
    for (let i = 0; i < Y.length; i++) {
      const a = Y[i]; if (!a.alive || a.gref || a.dev < 2) continue;
      const hc = this._hc(a.x, a.y);
      for (let k = S[hc]; k < S[hc + 1]; k++) {
        const b = Y[I[k]]; if (b === a || !b.alive || b.gref || b.k !== a.k || b.dev < 2) continue;
        if ((b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2 > R2) continue;
        if ((a.L > b.L ? a.L / b.L : b.L / a.L) > 1.25) continue;
        const tot = a.n + b.n, wb = b.n / tot;
        if (rand() < wb) { a.g = b.g; a.genes = b.genes; a.gen = b.gen; a.hue = b.hue; }
        a.W += (b.W - a.W) * wb; a.L += (b.L - a.L) * wb; a.age += (b.age - a.age) * wb; a.bdep = a.L * a.s.sp.depthR; a.n = tot;
        b.alive = false; b.n = 0;
        break;
      }
    }
  }

  // ---------- hazards: starvation, heat, hypoxia, other natural causes, old age ----------
  _hazards(a, T, dt) {
    const s = a.s, sp = s.sp;
    // THE FIRST WINTER (config WINTER0): a young-of-year past its autumn — the ramp's share of the survivors this step, in place of
    // its starvation (the ramp IS its winter's starvation)
    const fW = winterF(s.key, a.L, a.age, this.env.yearFrac(), dt), hW = fW >= 1 ? 50 / dt : fW > 0 ? -Math.log1p(-fW) / dt : 0;   // (only a fish alive at the winter's start: not this spring's larvae, hatched before the window closes)
    const hS = (a.K < BIOE.K_HAZARD && !(fW >= 0) ? -Math.log(Math.max(1e-9, 1 / (1 + Math.exp(-(BIOE.STARVE_A + BIOE.STARVE_B * a.K))))) / DAY : 0) + hW;
    const kx = expm(dt * TS / BIOE.EXPOSE_TAU); a.xo += (a.o2 - a.xo) * kx; a.xt += (T - a.xt) * kx;
    const hH = a.xt > a.uilt - 2 ? LN2 / (BIOE.UILT_DAYS * DAY) * Math.exp((a.xt - a.uilt) / BIOE.HEAT_STEEP) : 0;
    const o2Lx = lethalO2(a.o2Lethal, a.o2Ice, a.xt);
    const hO = a.xo < o2Lx ? LN2 / (BIOE.HYPOXIA_DAYS * DAY) * Math.exp(BIOE.HYPOXIA_STEEP * (o2Lx - a.xo) / o2Lx) : 0;
    const hM = sp.M * (s.mOther ?? BIOE.M_OTHER) * (F3.MOTHER_FLAT ? 1 : clamp(Math.pow(a.L / sp.Lref, -0.87), 0.5, 3)) / YEAR;   // (S3 mOther, F3.MOTHER_FLAT)
    const HW = this._wH || (this._wH = new Float64Array(WILDK.length)), hWd = F3.WILD && a.c >= 0 ? this._wildH(s.key, a.L, a.z, a.bed, a.cover, this.env.ice[a.c], HW) : 0;   // (E4: the wildlife)
    const hz = hS + hH + hO + hM + hWd, old = a.age > s.maxAge;
    const cause = old ? 'old' : hWd > hS && hWd > hH && hWd > hO && hWd > hM ? 'wild' : hS >= hH && hS >= hO && hS >= hM ? 'starve' : hH >= hO && hH >= hM ? 'heat' : hO >= hM ? 'hypoxia' : 'other';
    if (old || !(a.W > 0)) return this._die(a, cause, a.n);
    if (a.n > 1) {   // a school loses a fraction; the shares by cause
      const lost = a.n * (1 - Math.exp(-hz * dt));
      if (lost > 0) { for (const [c, h] of [['starve', hS], ['heat', hH], ['hypoxia', hO], ['other', hM], ['wild', hWd]]) if (h > 0) this._tallyDeath(s.key, c, lost * h / hz); if (hWd > 0) this._wildTally(s.key, HW, hz, lost, a.W); this.chem.addSedOM(a.jb, lost * a.W * (1 - hWd / hz)); a.n -= lost; }   // (the wildlife's take leaves the lake)
      if (a.n < 1) { a.alive = false; a.cause = cause; this.chem.addSedOM(a.jb, a.n * a.W); a.n = 0; }
    } else if (hz > 0 && rand() < 1 - Math.exp(-hz * dt)) { if (cause === 'wild') { this._wildTally(s.key, HW, hWd, 1, a.W); a.alive = false; a.cause = 'wild'; this._tallyDeath(s.key, 'wild', 1); a.n = 0; } else this._die(a, cause, 1); }   // (the wildlife's: no body left)
  }
  _die(a, cause, n) { a.alive = false; a.cause = cause; this._tallyDeath(a.s.key, cause, n); this.chem.addSedOM(a.jb, n * a.W); a.n = 0; }
  _tallyDeath(k, cause, n) { const d = this.stats.died; (d[k] || (d[k] = {}))[cause] = (d[k][cause] || 0) + n; }


  // ---------- (E8) THE SEA-RUN ALEWIFE (config ALEWIFE; docs/review/ECOSYSTEM_BUILD.md "E8"): the run in at Lower's outlet as the spring
  // warms, the adults' residence (spawning by the ripe-fish rules), their freshwater deaths and their leaving by the outlet, their
  // excretion and carcasses' N and P (an import — the ledger's in); the young's emigration and cold deaths are in _yoyLive ----------
  _outletXY() { if (!this._outXY) { const c = this.env.outCol; this._outXY = [this.G.cx[c], this.G.cy[c]]; } return this._outXY; }
  // the sim's (abstract) units per gram of P and of N: the lakes' water at their reference concentrations (ALEWIFE.TP_UGL, TN_UGL)
  _aleUnits() {
    if (this._aleU) return this._aleU;
    const ch = this.chem, G = this.G, Pu = PHYTO.P_USE, Nu = PHYTO.N_USE; let p = 0, n = 0, w = 0;
    for (let j = 0; j < G.NCELL; j++) { const v = ch.w[j]; if (!(v > 0)) continue; const al = ch.phyto[j] + ch.diatom[j] + ch.resA[j];
      p += (ch.phos[j] + al * Pu + ch.dom[j] * NUTRIENT.ORGANIC_P) * v; n += (ch.nh4[j] + ch.no3[j] + al * Nu + ch.dom[j] * (1 - NUTRIENT.ORGANIC_P)) * v; w += v; }
    const L = WORLD.CELL_L;   // (litres per 2-D cell: units × cells / (g/L × L) = units per g)
    return (this._aleU = { p: p / w / (ALEWIFE.TP_UGL * 1e-6 * L), n: n / w / (ALEWIFE.TN_UGL * 1e-6 * L) });
  }
  _aleNutr(j, jb, gP, gN, toBed) {   // grams in (+) or out (−) at water cell j (P to the bed's store at jb when toBed), in the ledger
    const ch = this.chem, u = this._aleUnits(), st = this.stats.ale, w = ch.w[j];
    if (gP > 0) { const x = gP * u.p; if (toBed && jb >= 0) ch.sedP[jb] += x / ch.a[jb]; else ch.phos[j] += x / w; ch.ledger.inP += x; st.pIn += gP; }
    else if (gP < 0) { const x = Math.min(-gP * u.p, ch.phos[j] * w); ch.phos[j] -= x / w; ch.ledger.outP += x; st.pOut += x / u.p; }
    if (gN > 0) { const x = gN * u.n; ch.nh4[j] += x / w; ch.ledger.inN += x; st.nIn += gN; }
    else if (gN < 0) { const want = -gN * u.n, a = Math.min(want, ch.nh4[j] * w), b = Math.min(want - a, ch.no3[j] * w); ch.nh4[j] -= a / w; ch.no3[j] -= b / w; ch.ledger.outN += a + b; st.nOut += (a + b) / u.n; }
  }
  // the run's arrivals over dt (the CPU's step and the GPU host's block alike): the year's run, the spring's warmest Lower surface, the
  // schools due by it — returned (the GPU host appends them to its arrays)
  _aleArrivals(dt) {
    const A = ALEWIFE, e = this.env, st = this.stats.ale, yr = Math.floor(e.time / YEAR), yf = e.yearFrac(), out = [];
    // this year's run (lognormal about the preset) and the spring's warmest Lower surface so far (a 2-day mean: a cold snap doesn't call it back)
    if (this._aleYr !== yr) { this._aleYr = yr; const sg = Math.sqrt(Math.log(1 + A.RUN_CV * A.RUN_CV)); this._aleRun = A.RUN_PER_ACRE * A.ACRES * (this.lakeHa / WILD_LAKE_HA) * Math.exp(sg * gauss() - sg * sg / 2); this._aleIn = 0; this._aleTmax = -1; st.run += this._aleRun; }
    const T0 = e.temp[this.G.cell0[e.outCol]]; this._aleTs = this._aleTs === undefined ? T0 : this._aleTs + (T0 - this._aleTs) * Math.min(1, dt / (2 * DAY));
    if (yf < 0.5) this._aleTmax = Math.max(this._aleTmax, this._aleTs);
    const [t0, tp, t1] = A.ARRIVE_T, x = this._aleTmax;
    const F = x <= t0 ? 0 : x >= t1 ? 1 : x <= tp ? (x - t0) ** 2 / ((t1 - t0) * (tp - t0)) : 1 - (t1 - x) ** 2 / ((t1 - t0) * (t1 - tp));
    const nS = clamp(this._aleRun / A.SCHOOLS, A.SCHOOL_MIN, A.SCHOOL_MAX);
    let due = this._aleRun * F - this._aleIn;
    while (due >= nS || (F >= 1 && due >= 1)) { const n = Math.min(nS, due); out.push(this._aleArrive(n)); this._aleIn += n; due -= n; st.arrived += n; }
    return out;
  }
  _alewife(dt) {
    const A = ALEWIFE, e = this.env, s = S3.alewife, st = this.stats.ale;
    this._aleArrivals(dt);
    // the adults: their freshwater deaths (SPENT over the median residence), their excretion, leaving once their time is up, and out at the outlet
    const hS = Math.log(1 / (1 - A.SPENT)) / (A.RESID * DAY), hrs = dt / DAY * 24, [ox, oy] = this._outletXY(), R = 1.5 * this.G.COL;
    for (const a of this.fish) {
      if (!a.alive || a.s !== s) continue;
      if (a.c >= 0) { const j = a.j >= 0 ? a.j : this.G.cell0[a.c]; this._aleNutr(j, a.jb, a.n * a.W * A.EXCR_P * hrs, a.n * a.W * A.EXCR_N * hrs, false); }
      const lost = a.n * -Math.expm1(-hS * dt);
      if (lost > 0) { this._tallyDeath('alewife', 'spent', lost); st.spent += lost; this.chem.addSedOM(a.jb, lost * a.W); if (a.c >= 0) this._aleNutr(a.j >= 0 ? a.j : this.G.cell0[a.c], a.jb, lost * a.W * A.BODY_P, lost * a.W * A.BODY_N, true); a.n -= lost; }
      if (a.n < 1) { a.alive = false; a.cause = 'spent'; continue; }
      if (!a.leave && e.time - a.aleT > a.aleRes) { a.leave = true; a.lake = LOWER; a.lhx = a.hx = ox; a.lhy = a.hy = oy; }
      if (a.leave && Math.hypot(a.x - ox, a.y - oy) < R) { a.alive = false; a.cause = 'emigrated'; st.left += a.n; }
    }
  }
  // a school of the run at Lower's outlet: ripe, its residence drawn, bound for Upper (UPPER of them: across Lower and up the brook) or Lower
  _aleArrive(n) {
    const A = ALEWIFE, s = S3.alewife, sp = s.sp, [ox, oy] = this._outletXY(), r = 0.5 * this.G.COL;
    const a = this.add('alewife', ox + (rand() - 0.5) * r, oy + (rand() - 0.5) * r, null, 4, n);
    a.L = clamp(A.L[0] + A.L[1] * gauss(), 25, 33); a.W = rand(0.95, 1.05) * stdWeight(sp.lw, a.L); this._settle(a);
    a.mature = true; a.gon = s.gsi(a.sex) * a.W; a.mateCd = 0; a.aleT = this.env.time; a.aleRes = A.RESID * Math.exp(A.RESID_SD * gauss()) * DAY; a.leave = false;
    const lake = rand() < A.UPPER ? UPPER : LOWER, p = this._homeIn(s, lake);
    if (p) { a.lake = lake; a.lhx = a.hx = p[0]; a.lhy = a.hy = p[1]; }
    const c = this.env.colAt(a.x, a.y); if (c >= 0) { a.c = c; a.j = this.G.cell0[c] + Math.min(this.G.nL[c] - 1, Math.max(0, (a.z / this.G.DZ) | 0)); a.jb = this.bedCell(c, a.bed); }   // (its cells from the start)
    return a;
  }
  // the GPU host's block sums (GL G_ALE: out n, spent n, spent g, excreted g·h, the young out n and g, the young's cold n): the stats, and the
  // N and P spread over the lakes (the water by volume, the bed by area — the CPU puts them where the fish are)
  _aleSums(v) {
    const A = ALEWIFE, st = this.stats.ale, fr = this.stats.fry.alewife, d = this.stats.died.alewife || (this.stats.died.alewife = {});
    st.left += v[0]; st.spent += v[1]; d.spent = (d.spent || 0) + v[1]; st.yOut += v[4]; st.yCold += v[6]; if (fr) { fr.emig = (fr.emig || 0) + v[4]; fr.cold = (fr.cold || 0) + v[6]; }
    this._aleNutrAll(v[3] * A.EXCR_P, v[3] * A.EXCR_N + v[2] * A.BODY_N, false); this._aleNutrAll(v[2] * A.BODY_P, 0, true); this._aleNutrAll(-v[5] * A.YOUNG_P, -v[5] * A.YOUNG_N, false);
  }
  _aleNutrAll(gP, gN, toBed) {
    const ch = this.chem, G = this.G, u = this._aleUnits(), st = this.stats.ale; let W = 0; for (let j = 0; j < G.NCELL; j++) W += ch.w[j];
    if (gP > 0) { const x = gP * u.p; if (toBed) { let Ab = 0; for (const j of ch.bedCells) Ab += ch.a[j]; for (const j of ch.bedCells) ch.sedP[j] += x / Ab; } else for (let j = 0; j < G.NCELL; j++) if (ch.w[j] > 0) ch.phos[j] += x / W; ch.ledger.inP += x; st.pIn += gP; }
    else if (gP < 0) { const c = -gP * u.p / W; let t = 0; for (let j = 0; j < G.NCELL; j++) { const w = ch.w[j]; if (!(w > 0)) continue; const y = Math.min(c, ch.phos[j]); ch.phos[j] -= y; t += y * w; } ch.ledger.outP += t; st.pOut += t / u.p; }
    if (gN > 0) { const x = gN * u.n; for (let j = 0; j < G.NCELL; j++) if (ch.w[j] > 0) ch.nh4[j] += x / W; ch.ledger.inN += x; st.nIn += gN; }
    else if (gN < 0) { const c = -gN * u.n / W; let t = 0; for (let j = 0; j < G.NCELL; j++) { const w = ch.w[j]; if (!(w > 0)) continue; const y = Math.min(c, ch.nh4[j]); ch.nh4[j] -= y; t += y * w; } ch.ledger.outN += t; st.nOut += t / u.n; }
  }
  // (E8) a young alewife's hazards this tick (/s): emigration [0] — from EMIG_YF, by its length, on the day's pulse — and cold [1]
  _aleYoung(q, T, c, yf, out) {
    const A = ALEWIFE, e = this.env; out[0] = out[1] = 0;
    if (e.ice[c] > 0.5) { out[1] = 50 / DAY; return out; }   // (under the ice: none survive)
    if (T < A.COLD_T) out[1] = A.COLD_M / DAY;
    if (yf >= A.EMIG_YF && e.qFac >= A.Q_MIN) { const fL = clamp((q.L - A.EMIG_L[0]) / (A.EMIG_L[1] - A.EMIG_L[0]), 0, 1); out[0] = fL * (A.EMIG_BASE + (this._alePulse ? A.EMIG_PULSE : 0)) / DAY; }
    return out;
  }
  // the day's pulse (once a day): rain or a flow rise (qFac × PULSE_Q in a day), or the air cooling PULSE_DT °C
  _aleDay() {
    const e = this.env, d = Math.floor(e.time / DAY); if (this._aleD === d) return; const q = e.qFac, t = e.airT ? e.airT() : seasonalTemp(e.yearFrac());
    this._alePulse = this._aleD !== undefined && ((this._aleQ > 0 && q >= ALEWIFE.PULSE_Q * this._aleQ) || e.weather >= 2 || this._aleAir - t >= ALEWIFE.PULSE_DT) ? 1 : 0;
    this._aleD = d; this._aleQ = q; this._aleAir = t;
  }
  // ---------- THE LAKES' FISH-EATING WILDLIFE (F3.WILD; WILD3) ----------
  // the shore's length (km: every water cell's land edges, × 0.8 for a raster's stair-steps — as littoral3's bank)
  _shoreKm() {
    if (this._shoreKmV) return this._shoreKmV;
    let m = 0; const NX = GEO.NX, NY = GEO.NY;
    for (let i = 0; i < GEO.N; i++) { if (GEO.body[i] === LAND) continue; const r = Math.floor(i / NX), q = i % NX;
      for (const [dq, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const qq = q + dq, rr = r + dr; if (qq < 0 || rr < 0 || qq >= NX || rr >= NY) continue; if (GEO.body[rr * NX + qq] === LAND) m += GEO.CELL * 0.8; } }
    return (this._shoreKmV = m / 1000);   // (the world's km: at 1/10 scale a tenth of the real shore, its fish a hundredth — densities per km
    // are scaled by the world's area against the real lakes', _wildN)
  }
  // how many of wildlife w are on the lakes at yf, and its fish share then (otter, mink: winter → summer)
  _wildN(w, yf) {
    const d = WILD3[w], [y0, y1] = d.yf; if (!(y0 <= y1 ? yf >= y0 && yf < y1 : yf >= y0 || yf < y1)) return 0;   // (a window may wrap the year's end: the ice anglers')
    const fa = this.lakeHa / WILD_LAKE_HA;   // (the world's share of the real lakes: 1 at true scale, ~0.01 at 1/10 — every count scales with the fish)
    const n = d.perHa ? d.perHa * this.lakeHa : d.perKm ? d.perKm * this._shoreKm() / GEO.SCALE * fa : d.perLake * fa;
    return n;
  }
  _wildNeed(w, yf) {   // g a day of fish for all of w on the lakes
    const d = WILD3[w], n = this._wildN(w, yf); if (!(n > 0)) return 0;
    const cold = clamp((15 - seasonalTemp(yf)) / 12, 0, 1), share = d.fish[1] + (d.fish[0] - d.fish[1]) * cold;
    let g = n * d.need; if (d.chick && yf >= d.chick.yf) g += n / 2 * d.chick.perPair * d.chick.need;
    return g * share;
  }
  // a fish's accessibility to w (0–1 × its preference): its length, its depth below the surface, the bed under it, its cover, the ice
  _wildV(w, key, L, z, bed, cover, ice) {
    const d = WILD3[w];
    const fL = L <= d.L[0] || L >= d.L[3] ? 0 : L < d.L[1] ? (L - d.L[0]) / (d.L[1] - d.L[0]) : L > d.L[2] ? (d.L[3] - L) / (d.L[3] - d.L[2]) : 1; if (!(fL > 0)) return 0;
    const fz = z <= d.z[0] ? 1 : z >= d.z[1] ? 0 : (d.z[1] - z) / (d.z[1] - d.z[0]), fb = bed <= d.b[0] ? 1 : bed >= d.b[1] ? 0 : (d.b[1] - bed) / (d.b[1] - d.b[0]);
    const fi = d.ice ? 1 : 1 - clamp(ice, 0, 1);
    return fL * fz * fb * fi * (1 - clamp(cover, 0, 1)) * (d.pref[key] ?? 1);
  }
  // each step: each wildlife's demand now (g/s: its day's fish need × its activity by the light, its daily mean 1), the fish it can reach
  // (Σ accessibility × mass, followed fish and the young), and its per-fish hazard per unit of accessibility, ρ = D / (A + K)
  // each wildlife's demand now (g/s; the GPU host's too: gpufish block → GL)
  wildDemand(D = this._wD || (this._wD = new Float64Array(WILDK.length))) {
    const e = this.env, yf = e.yearFrac(), sun = e.sun, li = sun > 0.3 ? 0 : sun > 0.02 ? 1 : 2;
    for (let w = 0; w < WILDK.length; w++) {
      const d = WILD3[WILDK[w]], mean = WILD_HOURS[0] * d.act[0] + WILD_HOURS[1] * d.act[1] + WILD_HOURS[2] * d.act[2];
      D[w] = mean > 0 ? this._wildNeed(WILDK[w], yf) * d.act[li] / mean / DAY : 0;
    }
    return D;
  }
  _wildPrep(dt = 0) {
    const e = this.env, R = this._wRho || (this._wRho = new Float64Array(WILDK.length)), Ae = this._wAe || (this._wAe = new Float64Array(WILDK.length));
    const ice = e.ice, A = this._wA || (this._wA = new Float64Array(WILDK.length)); A.fill(0); R.fill(0);
    const D = this.wildDemand(); if (!D.some(v => v > 0)) return;
    for (const a of this.fish) { if (!a.alive || a.c < 0) continue; const ic = ice[a.c];
      for (let w = 0; w < WILDK.length; w++) if (D[w] > 0) { const v = this._wildV(WILDK[w], a.s.key, a.L, a.z, a.bed, a.cover, ic); if (v > 0) A[w] += v * a.W * a.n; } }
    for (const q of this.yoy) { if (!q.alive || q.c < 0 || q.dev < 2) continue; const ic = ice[q.c];
      for (let w = 0; w < WILDK.length; w++) if (D[w] > 0) { const v = this._wildV(WILDK[w], q.s.key, q.L, q.z, q.bed, q.cover, ic); if (v > 0) A[w] += v * q.W * q.n; } }
    for (let w = 0; w < WILDK.length; w++) if (D[w] > 0 && A[w] > 0) R[w] = D[w] / (Math.max(A[w], Ae[w]) + D[w] * DAY);   // (K: a day's need; the reach as F3.WILD_TAU)
    const ke = Math.min(1, dt / (F3.WILD_TAU * DAY)); for (let w = 0; w < WILDK.length; w++) Ae[w] += (A[w] - Ae[w]) * ke;
  }
  // a fish's wildlife hazard (/s), its parts by wildlife into H (for the tallies)
  _wildH(key, L, z, bed, cover, ic, H) {
    const R = this._wRho; if (!R) return 0; let h = 0;
    for (let w = 0; w < WILDK.length; w++) { const r = R[w] > 0 ? R[w] * this._wildV(WILDK[w], key, L, z, bed, cover, ic) : 0; if (H) H[w] = r; h += r; }
    return h;
  }
  _wildTally(key, H, h, n, W) {   // n fish of mass W taken by the wildlife, by their shares of the hazard h
    const t = this.stats.wild; for (let w = 0; w < WILDK.length; w++) if (H[w] > 0) { const k = WILDK[w], o = t[k] || (t[k] = { n: {}, g: 0 }), x = n * H[w] / h; o.n[key] = (o.n[key] || 0) + x; o.g += x * W; }
  }
  // ---------- schools meet and merge, and split when large ----------
  _schools() {
    const f = this.fish, born = [];
    if (this.env.time - this._soloAt > F3.SOLO_EVERY * DAY) this._soloCut();
    for (let i = 0, n0 = f.length; i < n0; i++) {
      const a = f[i]; if (!a.alive || !a.school) continue;
      const s = a.s, gs = this._gSize(s);
      if (a.L >= this._soloOf(s) && !a.ripe && !(a.nt > 0)) { this._dissolve(a); continue; }   // (grown to its own brain)
      if (a.n > gs * F3.SPLIT) { born.push(this._split(a)); continue; }
      // the nearest school of its kind and size within reach (the hash cells within MERGE_R of it — two schools a metre apart
      // across a cell's edge are as near as any)
      const S = this.hStart, I = this.hItems, R = F3.MERGE_R;
      const gx0 = clamp(((a.x - R - this.hX0) / F3.HC) | 0, 0, this.HX - 1), gx1 = clamp(((a.x + R - this.hX0) / F3.HC) | 0, 0, this.HX - 1);
      const gy0 = clamp(((a.y - R - this.hY0) / F3.HC) | 0, 0, this.HY - 1), gy1 = clamp(((a.y + R - this.hY0) / F3.HC) | 0, 0, this.HY - 1);
      search: for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
        const hc = gy * this.HX + gx;
        for (let q = S[hc]; q < S[hc + 1]; q++) {
          const b = f[I[q]]; if (!b || b === a || !b.alive || b.k !== a.k || !b.school) continue;
          if (Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) > R) continue;
          const lr = a.L > b.L ? a.L / b.L : b.L / a.L; if (lr > F3.MERGE_LR || a.n + b.n > gs * F3.MERGE_MAX) continue;
          this._merge(a, b); break search;
        }
      }
    }
    for (const b of born) this.fish.push(b);
  }
  _merge(a, b) {   // b joins a; the school keeps one parent's genome, chosen ∝ n
    const tot = a.n + b.n, wa = a.n / tot, wb = b.n / tot;
    if (rand() < wb) { a.g = b.g; a.lw = b.lw; a.h = b.h; a.leak = b.leak; a.genes = b.genes; a.gen = b.gen; a.hue = b.hue; this._traits(a); }
    a.W = a.W * wa + b.W * wb; a.L = Math.max(a.L * wa + b.L * wb, 0.1); a.gut = a.gut * wa + b.gut * wb; a.gutE = a.gutE * wa + b.gutE * wb;
    a.gon = a.gon * wa + b.gon * wb; a.age = a.age * wa + b.age * wb; a.cons = a.cons + b.cons; a.consMax = a.consMax + b.consMax;
    a.mature = a.mature || b.mature; a.n = tot; b.alive = false; b.cause = 'merged'; b.n = 0;
    this._settle(a);
  }
  _split(a) {
    const b = new Fish(); Object.assign(b, a);
    b.id = this.nextId++; b.lw = Float32Array.from(a.lw); b.h = Float32Array.from(a.h); b.o = Float32Array.from(a.o);
    b.n = a.n / 2; a.n -= b.n; b.cons = a.cons = a.cons / 2; b.consMax = a.consMax = a.consMax / 2;
    b.yaw = a.yaw + (rand() < 0.5 ? 0.7 : -0.7); b.prey = b.threat = null;
    return b;
  }

  // ---------- reading the fish ----------
  count(k) { let n = 0; for (const a of this.fish) if (a.alive && (k === undefined || a.s.key === k)) n += a.n; return n; }
  biomass(k) { let w = 0; for (const a of this.fish) if (a.alive && (k === undefined || a.s.key === k)) w += a.n * a.W; return w; }   // g
  census() {
    const out = {};
    for (const k of KEYS3) out[k] = { n: 0, agents: 0, g: 0, L: 0, cons: 0, consMax: 0, mature: 0, yoyN: 0, yoySchools: 0, yoyG: 0, yoyL: 0, eggN: 0 };
    for (const q of this.yoy) { if (!q.alive) continue; const r = out[q.s.key]; if (q.dev < 2) { r.eggN += q.n; continue; } r.yoyN += q.n; r.yoySchools++; r.yoyG += q.n * q.W; r.yoyL += q.n * q.L; }
    for (const a of this.fish) {
      if (!a.alive) continue; const r = out[a.s.key];
      r.n += a.n; r.agents++; r.g += a.n * a.W; r.L += a.n * a.L; r.cons += a.n * a.cons; r.consMax += a.n * a.consMax; if (a.mature) r.mature += a.n;
    }
    for (const k of KEYS3) { const r = out[k]; r.L /= Math.max(1e-9, r.n); r.yoyL /= Math.max(1e-9, r.yoyN); r.p = r.cons / Math.max(1e-12, r.consMax); r.kgHa = r.g / 1000 / this.lakeHa; r.perHa = r.n / this.lakeHa; r.meanW = r.g / Math.max(1e-9, r.n); }
    return out;
  }
  resetIntake() { for (const a of this.fish) { a.cons = 0; a.consMax = 0; } }
  // the fish for the renderer: [x, y, z, yaw, pitch, length (cm), species index, n, speed] per agent
  snapshot(out) {
    const f = this.fish; let q = 0; const need = f.length * 9; if (!out || out.length < need) out = new Float32Array(need * 1.25 | 0);
    for (const a of f) { if (!a.alive) continue; out[q++] = a.x; out[q++] = a.y; out[q++] = a.z; out[q++] = a.yaw; out[q++] = a.pitch; out[q++] = a.L; out[q++] = a.k; out[q++] = a.n; out[q++] = a.spd; }
    return { buf: out, n: q / 9 };
  }
}
