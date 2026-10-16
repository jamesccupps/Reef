# The 3-D sim on a real-time clock: the audit (stage R1)

Written 2026-10-16. It audits branch `zoo-field` at da8bd4b (stage 7d, the mussels). Line numbers refer to that commit.
`src/w3` there is identical to the working copy read for this audit, and test/w3.mjs lines are those of da8bd4b. Nothing in
`src/` or `test/` was changed. The measurements were run from scratch scripts outside the repo, in
`C:\Users\james\AppData\Local\Temp\claude\w3audit\`:
- `cost.mjs`, `fishparts.mjs`, `fishrt.mjs` and `diel.mjs` are the scripts;
- `rt/` is a copy of `src/` with only `CLOCK3`, `H3.MIX_RATE` and `H3.K_STRAT` edited, used to try the real-time clock;
- `gate_timing.txt` is a timestamped run of `test/w3.mjs`.

The decision (human, 2026-10-16; SESSION_STATE "DECIDED", HOT_BROOK_3D.md:481):
- 1× means real time: a day is 86,400 s and a year is 365 days.
- Each animal lives its day in full detail.
- Fast-forward integrates the same per-real-second rates over coarser steps. This is the fidelity ladder: fine (dt 0.1 s, brains at 5 Hz) for watching; medium; and coarse (dt 60–300 s or more) for seasons, the gate and evolution.

This document is the blueprint for R2 (the clock), R3 (the fish) and R4 (the gate).

---

## 0. Summary

**How time works today.** One clock does two jobs at once, and the rest of this audit follows from that.

| | per step today | real seconds of calendar per step |
|---|---|---|
| A fish step `F.step(0.1)` | 0.1 s of swimming at real speed | **876 s** (14.6 min) of physiology, hazards, ageing |
| A feeding call or decision (every 2nd fish step) | 0.2 s | **1,752 s** of feeding |
| An env step `e.step(0.2)` | — | **1,752 s** of heat, chemistry, plankton, transport |
| The slow pools (`CHEM3.SLOW`, `PL3.SLOW`, littoral every 3rd) | — | **5,256 s** (88 min) |
| A young-of-year tick (`F3.YOY_TICK` 0.4) | — | **3,504 s** (58 min) |
| A schools merge pass (`MERGE_EVERY` 10) | — | **8,760 s** (2.4 h) |
| A day–night cycle (`DAY_LEN` 120) | — | **12.2 calendar days** |

So today a fish swims about 10 s a calendar day, about 7 m. Its whole day of feeding, hunting and travel is folded into
shortcuts. Today's gate is therefore already a coarse run in calendar terms: the fish at 876 s and the water at 1,752 s.

**Counts.** Each item has file:line references in its section.

| Category | Items |
|---|---|
| **A** calendar-scaled, carries over | **A0**: the clock constants and their captures. **A1–A5**: 105 rate sites (env3 14, chem3 36, plants3 10, littoral3 20, fish3 25). **A6**: 15 constants already in real seconds (carry unchanged). **A7**: 11 *hidden* compressed-clock rates that will NOT carry over |
| **B** shortcuts for the compressed clock | **14** (B1–B14) |
| **C** time-step-dependent | **24** (C1–C24) |
| **D** day–night and calendar | **20** (D1–D20) |

**The biggest risks**, in order:
1. **Coarse ↔ fine equivalence, and what the brain does in coarse mode.** If coarse mode bypasses the brains, then years of fast-forward evolve nothing in them. That contradicts the vision ("each animal actually thinking, learning… then slowly evolving"). This needs a decision with the human (§7, R3-g).
2. **Hidden compressed-clock rates (A7).** These are per-sim-second constants not routed through `TS`/`REAL_S`/`DAY3`:
   - `H3.MIX_RATE` and `H3.K_STRAT`;
   - `F3.YOY_TICK`, `F3.ATTACK`, `F3.SPAWN_RATE`;
   - `LEARN.DECAY`;
   - the `BITE_MIN·dt/(1/30)` meal threshold;
   - the test's and worker's literals.

   Switching `CLOCK3` silently makes them 8,760× wrong. Their clamps hide the error (instant full mixing, for example). R2 should first be a *compat* refactor that reproduces today's results on the real-time clock (§7).
3. **Calibration drift from the diel cycle.** Today each 120-s "day" carries 12 calendar days of production and respiration, so the diel swings are exaggerated. Measured on the same lake, same date and weather (§5):

   | Diel swing | Today | Real time |
   |---|---|---|
   | Cove O₂ | 12.9 mg/L (1.6–14.5) | 5.1 mg/L |
   | Basin surface O₂ | 7.9 mg/L | 1.4 mg/L |
   | Cove surface temperature | 5.2 °C | 2.4 °C |

   The field value is 2.1 ± 1.0 °C in coloured lakes (LLS:168). Hypoxia exposure, the zooplankton O₂ floor, the bed's redox P switch and the gate's O₂ checks were all tuned under the exaggerated swings.
4. **Diel-resolved feeding will starve fish unless the intake cap changes first.** `want` caps intake at the Cmax *rate* every second (fish3.js:749, `PLANKTON.Q` = `BENTHOS.Q` = 1). A fish that feeds only half the day then gets at most half its Cmax. Raise the bout intake (Q 2–4, handling-limited; FZC:505) *before* feeding follows the hour's light.
5. **The 1/10 horizontal scale.** Fish swim at real speed through lakes 10× smaller. In real time a dusk migration, a spawning run or a home range is crossed 10× faster than in the real lake. This trade-off was set for the 1-hour year (HOT_BROOK_3D.md:17–26) and needs re-deciding (§7, R3-h).
6. **The gate's budget.** The w3 gate measured 12.7 min today. To stay there, its long runs need the coarse rung at **fish dt ≈ 900 s and water dt ≈ 1,800 s**. That is the same calendar step as today. At 300 s/300 s the same runs take about 37 min (§6.3). Multi-seed calibration and coarse-vs-fine equivalence belong in a separate long suite.

**Cost (measured; this machine; single thread).**

| | Per step |
|---|---|
| `Env3.step`, default 5-m grid, today | 15.4 ms (transport 9.0, chemistry 4.8) |
| `Env3.step`, 5-m grid, real-time clock | 9.5–11 ms at dt 10–300 s (fewer transport sub-steps); 14.7 ms at dt 1,800 s |
| `Env3.step`, 10-m grid | 3.3 ms |
| `Fish3.step`, ~3,080 agents / 16,500 fish | 19 ms in winter; 24–29 ms in July with ~300 young schools |
| `Fish3.step` without senses, brain, drive and movement ("coarse", estimated) | ~13 ms |

| Rung | Wall clock per sim day | Per sim year | Speed |
|---|---|---|---|
| Watch: fish 0.1 s, water 60 s | 5.3 h | 80 days | **4.5×** real time at most |
| Medium: fish 1 s with sub-stepped motion, water 60 s (estimated) | ~58 min | ~15 days | ~25× |
| Coarse-60: fish 60 s, water 60 s | 33 s | 3.4 h | ~2,600× |
| Coarse-300: fish 300 s, water 300 s | 6.9 s | 42 min | ~12,500× |
| Gate rung: fish 900 s, water 1,800 s, 10-m grid | 1.4 s | 8.6 min | ~60,000× |

---

## 1. The clock today, and what each constant becomes

`src/w3/clock3.js`:

| Line | Constant | Today | Real time |
|---|---|---|---|
| 5 | `CLOCK3.YEAR_LEN` | 3,600 | 31,536,000 |
| 5 | `CLOCK3.DAY_LEN` | 120 | 86,400 |
| 6 | `TS = 1800 / YEAR_LEN` (a 2-D per-second rate → this clock) | 0.5 | 5.708e-5 = 1/17,520 |
| 7 | `REAL_S` (real s per sim s) | 8,760 | 1 |
| 8 | `DAY3` (sim s per calendar day) | 9.863 | 86,400 |

The 2-D sim's own clock (`config.js:56–63`: `TIME.YEAR_LEN` 1,800, `DAY_LEN` 60) stays as it is. The w3 sim inherits its
per-2-D-second rates through `TS`. Today's per-calendar-second value of a 2-D rate r is r·0.5/8,760 = r/17,520. On the
real-time clock it is r·5.708e-5 = r/17,520 per real second. So **every rate routed through `TS`, `DAY3`, `REAL_S`,
`YEAR` or per-day config carries over exactly**. Only the step it is integrated over changes.

---

## 2. Category A — calendar-scaled (carries over)

### A0. The clock constants, where they are captured, and what must be re-derived

All three are `export const`. They are computed once when `clock3.js` loads, and the importers bind them by value:
- `env3.js:22`, re-exported at `env3.js:26`;
- `chem3.js:15`;
- `plants3.js:12`;
- `littoral3.js:16`;
- `fish3.js:22`.

Editing `CLOCK3` in clock3.js re-derives them all on the next load. That is enough for a one-time switch to real time. The clock is fixed, and the fidelity ladder changes *dt*, not the clock, so none of them needs to become dynamic. These are the places that capture them, or a value derived from them, at load or at construction:

| Where | What | Status |
|---|---|---|
| fish3.js:30 | `YEAR = CLOCK3.YEAR_LEN`, `DAY = DAY3`, `Y2 = TIME.YEAR_LEN` (module load) | fine at a fixed clock |
| fish3.js:155–168 | per species at module load: `maxAge`, `matMinAge`, `mateCd` (158), `guard` (165), from the 2-D seconds `/ Y2 * YEAR` | carries (e.g. smallmouth guard `yr(0.08)` = 29 days) |
| env3.js:51 | `H3.WEATHER_DWELL_MUL = 1 / TS` (module load) | carries: spells of 2.0–5.3 calendar days (`ENV.WEATHER_DWELL` [26,20,16,10] 2-D s, config.js:641, × 0.6–1.4) |
| env3.js:220–235 | through-flow discharges `qU`, `qL` = volume / (RES × `DAY` / `REAL_S`) (224), the implicit through-flow tables (226–235), built once in `_statics` | carries (m³ per real s) |
| env3.js:287 | water-age tracer primed at RES × `DAY` / `REAL_S` | carries (age in sim s = real s) |
| config.js:116 | `BIOE.DAY` getter = `TIME.YEAR_LEN / 365` (2-D clock) → the getters `SEDOM.K20` (793), `BENTHOS.G` (811), `BENTHOS.M` (814), `BENTHOS.ANOX_M` (819) are per **2-D** second; chem3 multiplies them × `TS` (343, 355, 357) | carries **only while** `TS` hard-codes 1800 = `TIME.YEAR_LEN` (config.js:58). **Fix in R2:** `PER2D = TIME.YEAR_LEN / (365*86400)` in clock3, used wherever `TS` is today |

**Recommendation for clock3.js in R2:**
- Set `YEAR_LEN` = 365·86,400 and `DAY_LEN` = 86,400.
- Add `PER2D` (the 2-D rate → per real second). Make `TS` an alias of it, or rename every use.
- Keep `REAL_S` = 1 for one release, so that the formulas still read correctly, then delete it.
- `DAY3` and env3's `DAY` both become 86,400.

### A1. env3.js (14 sites)

| Line | What | Rate basis |
|---|---|---|
| 193, 249 | `time = yf0 · YEAR_LEN`; `yearFrac()` | calendar |
| 195, 256, 260, 268 | weather timer and dwell (× `WEATHER_DWELL_MUL`) | calendar (2–5-day spells) |
| 215, 357, 361, 366 | wind circulation and drift → face fluxes × `toW = REAL_S / REAL` | real m/s, ×REAL_S |
| 224–226, 393, 425–449 | through-flow at 100- and 55-day residence (`RES_*_D` 45), implicit | calendar |
| 287, 311 | water-age tracer (+= dt) | sim s = real s |
| 327 | under ice, `H3.ICE_CHILL` 0.1 /2-D-s × `TS` (relax to 0.2 °C; e-fold ~2 days) | calendar (clamped: C11) |
| 328 | `H3.BED_HEAT` 0.03 /2-D-s × `TS` × bed area / volume (toward 4 °C) | calendar (clamped: C11) |
| 336 | `ENV.TEMP_RELAX` 0.4 /2-D-s (config.js:649) × `TS` × clamp(2.5/M): e-fold 12 h at M = 2.5 m, 3 h at M ≤ 0.6 m | calendar (**see D5**: the diel swing shrinks) |
| 344 | `ICE.MELT` 0.05 /2-D-s × `TS` (≈ 4 days to clear) | calendar |
| 345 | `ICE.GROW` 0.03 /2-D-s × `TS` (≈ 7 days to full cover) | calendar |
| 451, 538 | horizontal mixing K = `H3.K_H` × `REAL_S` / 100 (Lawrence 1995: 0.024 m²/s at 50 m) | real m²/s |
| 464, 474, 552, 563 | siphon and under-ice slope flow × `toW` (`SIPHON_V` 0.009 m/s, `ICE_SLOPE_V` 0.003) | real m/s |
| 287 vs test w3.mjs:111 | residence check uses `86400 / REAL_S` | carries |
| 300–301 | `iceMean` area weighting | no time |

### A2. chem3.js (36 sites)

Every water rate is a 2-D per-second rate × `TS` × dt. Every slow-pool rate is per calendar day (dd = ds/`DAY3`), per year
(`dt / YEAR_LEN`), or a per-2-D-second getter × `TS`. All of them carry. Their clamps are listed under C.
- **Turbidity:** 134 (`TURBIDITY.RELAX` 0.08, e-fold 2.5 days).
- **Green algae:** 171 growth `PHYTO.GROW` 0.95 (max 4.7/day), 172 decay 0.06, 176 O₂.
- **Diatoms:** 182 growth `DIATOM.GROW` 0.7, 183 decay, 187 O₂.
- **Cyanobacteria:** 192 growth 1.6, 193 decay, 198 O₂.
- **Vertical movement:** 203 buoyancy `CYANO.BUOY` 0.6 (~1 layer per 8 h, ~1.7 m/day); 206 diatom sinking `DIATOM.SINK` 0.5 (~1 layer per 10 h).
- **Zooplankton:**
  - 223 per day (`G_*`, `R_*`, `M_*`, `ANOX_M`);
  - 224–225 dormancy per day;
  - 226 toxicity and `FLOOR_RATE` × `TS`;
  - 227 rotifers per day;
  - 244 grazing `GR_*` × `TS`;
  - 254 egg loss per year and hatching per day;
  - 267 the daily round `P.MIX` × `TS`;
  - 273 anoxia avoidance `P.AVOID` × `TS`.
- **Water-column and bed O₂ demand:** 285 (`O2_PELAGIC`, `O2_SED`).
- **Microbes:** 302 (`MICROBE.BACT`).
- **The bed's bound P:**
  - 315 oxic release `REL_OXIC`;
  - 321 settling;
  - 323 baseline rain;
  - 327 anoxic release;
  - 328 binding;
  - 329 burial.
- **The bed's organic layer:** 337 catchment input `ALLOCH` × dt / `YEAR_LEN`; 343 decomposition `K20` (per 2-D s) × `TS`; 344 periphyton `PERI_G` × `TS`.
- **Worms and scuds:** 355 growth, 357 deaths (getters × `TS`).
- **The N cycle:** 368 nitrification, 369 denitrification.
- **Aeration:** 379.
- **Also time-related, not counted:** the `TS` import (15), the conversion comment (11), and 130 (`dd`, unused in `step`).

### A3. plants3.js (10 sites)

dd = ds/`DAY3` (137, 213). All rates are per day:
- the forms' `mu` (FORMS3 28–37);
- `PL3.RESP` (41);
- `SPROUT` (44, used at 153);
- growth (170–173);
- wave mortality `WAVE_M` (51, used at 176);
- autumn storage `STORE_RATE` (47, used at 178);
- ice scour b·min(1, dd) (181);
- the reserves' respiration (186);
- O₂ per day spread by the hour's light (225).

`gnet` is kept per day (173).

### A4. littoral3.js (20 sites)

dd = ds/`DAY3` (187). Per day:
- **Degree-days:** 193 (and the date initialiser `_ddFor` 149–153, 1/365 steps); the reset at 190.
- **Emergence:** 194, 212.
- **Weed fauna:** production `R_S`/`R_L` (205); maturation (209); deaths (216).
- **Snails:** growth (220); deaths (224).
- **The surface:** fly-off `FLY` and drowning `DROWN` (231); terrestrial fall `FALL` per day (234).
- **Crayfish:** young's growth exp(gY·q·dd) (247–248); adults' growth (254); snail eating (256); deaths (263–264); the date initialiser `_crDate` (161–168).
- **Mussels:** hours = dd·24 (273); recruitment per year in a June window (275, 294); clearance `MU_CR` L/h (280); O₂ `MU_O2` mg/h (290).

### A5. fish3.js physiology and life history (25 sites)

- **Ageing and maturity:**
  - 389 age = yrs·`YEAR`;
  - 425 the maturation reaction norm /`YEAR`;
  - 495 `age`, `mateCd`, `nt` += dt (sim s = real s).
- **Energetics (`_energetics`):**
  - 717 dd = dt/`DAY`;
  - 720 gastric evacuation per day (`BIOE.GER` 1.176·e^0.072T, × gerMul; clamped: C5);
  - 724 Cmax bookkeeping;
  - 727 `uAvg`, the ~1-day mean speed (min(1, dd));
  - 731 respiration g O₂/day → `rO2` per s;
  - 732 net energy per dd.
- **Feeding:** 749 `want = Cmax·apt·W·dt/DAY` per call (but see **B9**).
- **Kills:** 843 `missCd = FEED.MISS_CD / TS`. Note: 0.1 2-D s → 0.2 sim s today = **29 min** of calendar, and 1,752 s on the real-time clock. It carries, but it is set after a *kill*, not after a miss; see B1.
- **Hazards (`_hazards`):**
  - 1154 starvation per day;
  - 1155 the O₂/temperature exposure filter `kx = dt·TS/BIOE.EXPOSE_TAU` (`EXPOSE_TAU` 0.5 2-D s = 2.4 h, config.js:141);
  - 1156 heat per day;
  - 1158 hypoxia per day;
  - 1159 other natural deaths per year;
  - 1164 and 1167 losses as 1 − e^(−h·dt), exact at any dt.
- **Young of the year:**
  - 1022–1026 hazards per day and per year, exact exponential;
  - 1034 overwinter age `FRY.OVERWINTER`·`YEAR`;
  - 1066–1067 ration per dd (Cmax × `CMAX_LARVA`);
  - 1100 `rO2`;
  - 1101 the realised `p`, a ~1-day mean;
  - 1107–1108 starvation time per day;
  - 1117 age in years.
- **Brook season:** 872 `_brookSeason` (yf window and temperature).

### A6. Constants already in real seconds (15, carry unchanged)

These were never compressed. They are real behavioural or physical rates, and they become *correct in context* in real time:
- **Fish (fish3.js):**
  - `F3.DRAG` 1.4/s (38);
  - `PITCH_RATE` 3/s (40);
  - `TURN_HP` 3 s (43);
  - `LOOK` 1.2 s (49);
  - `FEAR_DECAY` 0.5/s (52, used at 509 as e^(−k·dt));
  - `ESC_PITCH` (47);
  - the S3 speeds (cruise, sprint, sustain in BL/s, turn in rad/s; 106–134);
  - `YOY_VMAX` 0.25 m/s (84).
- **Water (env3.js):**
  - `H3.CIRC_RMS` 0.02 m/s (33);
  - `DRIFT` 0.012 (34);
  - `WIND_MS` (36);
  - `K_H` (37);
  - `SIPHON_V` (40);
  - `ICE_SLOPE_V` (41).
- **`ACTION.*`** (config.js:1234–1244): dimensionless.

### A7. ✗ Hidden compressed-clock rates: they do NOT carry over (R2 landmines, 11)

These are per-*sim*-second constants or literals that take the 1-hour year for granted. On the real-time clock they become 8,760× too fast, or their meaning changes. The "compat" column is the value that reproduces today's per-calendar behaviour on the real-time clock (for the R2 refactor, §7). The mechanism column says where the real fix lives.

| # | Where | Today | Effect on the real-time clock | Compat value | Real fix |
|---|---|---|---|---|---|
| 1 | env3.js:46 `H3.MIX_RATE` 1.0/s, used 486, 580 (`kMix = clamp(MIX_RATE·dt, 0, 1)`) | mixed-layer e-fold 1 sim s = 2.4 h | full mixing every step (the clamp hides it) | 1.14e-4/s | τ_mix from wind/convection (§C14) |
| 2 | env3.js:49 `H3.K_STRAT` 0.02/s, used 486, 580 (clamp 0.5) | 1 layer exchange per 50 sim s = 5.1 days | half-mixed every step | 2.28e-6/s | Kz/DZ² (§C14) |
| 3 | fish3.js:83 `F3.YOY_TICK` 0.4, a literal (= `FRY.TICK` 0.2 / `TS` 0.5), used 935, 1011 | 58 min of calendar | 0.4 real s: 8,760× the work for the young | 3,504 s | ticks in seconds by rung (C10) |
| 4 | fish3.js:56 `F3.ATTACK` 2.0 per sim s, used 834 | kill hazard per 2.4 h | kills 8,760× too often (measured: 35 kills in 150 s at dt 1) | 2.28e-4/s | **B1** |
| 5 | fish3.js:74 `F3.SPAWN_RATE` 0.25/s, used 916 | ~10 h to spawn once on the ground with a mate | ~4 s | 2.85e-5/s | **B7** |
| 6 | config.js:1289 `LEARN.DECAY` 0.5/s via fish3.js:210 (`dec = DECAY·dt`) | learned weights relax over 2 sim s = 4.9 h | memory of ~2 s; linear decay unstable for dt > 2 s | 5.7e-5/s | **B8**, C3 |
| 7 | fish3.js:809 `ate = gain ≥ BITE_MIN·gmax·dt/(1/30)` | a "meal" = ≥ 1.2 % of the gut per 0.2-s call | at fine dt intake per call is ~1e-6 of the gut, so no reward ever | scale by calendar dt | **B8** |
| 8 | test/w3.mjs literals | 9.86 days (286–287); 98.6 steps a day (323, 424); `/ 3600` (327); `CLOCK3.DAY_LEN * 2` at 0.1 (123); `CLOCK3.YEAR_LEN` at 0.2 (188, 505) | runs of 1.7 M to 158 M steps | — | **R4**: write every run in days, by rung |
| 9 | sim3worker.js:22–29 `F.step(0.1); env.step(0.2)`; `BUDGET` 40 ms | fixed steps | at 1×, 1 real s → 10 fish steps: correct; at 1,000× → 10,000 steps a second: impossible | — | **R5**: the worker steps by rung |
| 10 | Comments and docs that state the compressed clock: env3.js:9–11; fish3.js:14–20; chem3.js:412–413; config.js:840–841 (PLANKTON); HOT_BROOK_3D.md §1 | — | misleading | — | R2: rewrite |
| 11 | clock3.js:6 `TS = 1800/YEAR_LEN` hard-codes the 2-D year | consistent today | breaks if `TIME.YEAR_LEN` is ever changed (A0) | — | R2: `PER2D` |

---

## 3. Category B — shortcuts for the compressed clock (14)

Each entry covers:
- what it does now;
- why it exists;
- the real-time mechanism, for fine mode, with a target and where the number comes from;
- the coarse-mode form (fidelity ladder).

The note abbreviations are those of the research extraction (Appendix B): PHY, PPSP, FMG, FZC, PIKE, ECO, …

### B1. Piscivory as a kill hazard (`F3.ATTACK`)

- **Where:**
  - fish3.js:53–56: `ATTACK` 2.0, `SCHOOL_EXP` 0.5.
  - `_strike`, fish3.js:814–845:
    - the reach R = strikeR·lunge·max(0.3, **visDay**) uses the *day's* light (816);
    - candidates are prey within R at this instant, weighted by (1 − d/R)·capture·vuln·size·hide·(1 − cover)·n^0.5;
    - rate = ATTACK·perf·dt (834);
    - P(kill) = 1 − e^(−rate·ΣK) (835);
    - one fish is taken, a school loses one (841);
    - `missCd = MISS_CD/TS` after the kill (843).
  - Called every 2nd step with dt × 2, only if gut room fits the whole prey (751, 826).
- **Why:** a sim second stood for 2.4 h of hunting. A predator could not *swim* into the right number of encounters, so its prey within strike reach at one instant were treated as its whole hunting session.
- **Real time (fine).** Discrete events, using pieces that already exist:
  1. **Detection.** Prey within the sensed range `senseR·vis`. Use the *instantaneous* light at the predator's depth (a.vis, 506), not `visDay`.
  2. **Motivation gate.** Hunger (gut room ≥ prey mass, and hunger > ~0.3) and the brain's strike output (`engaged(o[3])`, already computed at 681).
  3. **Approach.** Pursuit steering exists (641, PURSUIT_W). Chain pickerel stalk and hover before striking (an angler saw ~5 min, PPSP:383).
  4. **The strike.** One event once within `strikeR·lunge`. A 0.1–0.3-s lunge (the thrust burst exists, 689).
  5. **Outcome.** p = capture·vuln·size refuge·(1 − cover)·hide·light·confusion. The school's n^0.5 becomes a per-strike *confusion* factor on the success, not a multiplier on a hazard.
  6. **After.** A miss gives a refractory of seconds; the prey flees (fear already rises when a threat is near). A kill gives handling time, then satiation through the gut.
- **Numbers to aim for:**
  - Lab capture per strike: esocids 0.78 on gizzard shad and 0.67 on fathead (PIKE:59); 0.14 on bluegill (ECO:63, 69 — not 0.44).
  - The sim's 6-cm sunfish ≈ 0.12, consistent with that (ECO:69).
  - Bass capture > 95 % down to moonlight (3e-3 lx), 62 % at starlight, ~0 in darkness (PPSP:90–91).
  - Captures fall to ~0 at ≥ 250 stems/m² (LMB:398).
  - Rations:
    - pike 1–3 %BW/day in summer (PIKE:101, 111);
    - a 65-cm pike needs ~8–10 six-cm sunfish a day for maintenance (PIKE:150–170);
    - smallmouth Q/B 4.07/yr (WLE:129);
    - largemouth up to > 5 %BW/day in late August (LMB:373).
  - Empty stomachs 35–67 % (pike, PIKE:114) and 18 % (pickerel, PPSP:352). This is a calibration target for meal frequency.
  - **Not in the notes:** attack rates per hour and field strike success (PIKE:269, 293). They must be calibrated: tune so the daily ration and the empty-stomach share match.
- **Coarse mode.** Kills per dt are drawn as Poisson(λ·dt), with λ an encounter-rate integral from a Holling type II:
  - Search rate a = π·R_detect²·v_search, times the prey density in the predator's habitat block (the species' habitat overlap in the block), times p(capture), divided by 1 + a·h·N.
  - Cap by gut room.
  - This replaces `F3.ATTACK` with a derived a and h. The equivalence test: a fine run's kills per predator per day ≈ the coarse run's, on 3 seeds.

### B2. The foraging footprint (one sim second = 2.4 h of foraging)

- **Where:**
  - fish3.js:66–71 (`FP_HOME` 0.25, `FP_MIN` 4, `FP_MAX` 20, `FP_DZ` 0.75);
  - `forageR` 167;
  - `_footprint` 345–351;
  - used in `_feed` 768–778;
  - the take functions: chem3 `takeBenthCells` 473–480, `zooFeedCells` 443–464, `zooEcells` 466–470; littoral3 `takeWeedCells` 326–352, `weedEcells` 316–323, `surfEcols`/`takeSurfCols` 365–373.
  - The senses look two rings of columns out for bed food (`nbr2`, 299, 567).
- **Why:** a white perch school stripped its 10-m patch in ~4 sim-days. At real speed it needed ~11 to reach the next (HOT_BROOK_3D.md:251–255). The fish could not move as far as its feeding implied.
- **Real time (fine).** Feed from the cells the fish actually occupies: its own cell ± one layer for zooplankton (as `zooFeed`), and its bed cell `jb` (as `takeBenth`).
  - The rate is a functional response on search: intake/s = a·E/(1 + a·h·E), with a = swept volume (planktivores: π·R_react²·v) or swept area (bed: bite width·v). Handling time h comes from Q·Cmax (B9).
  - Depletion happens where fish are, and the track over a day samples the habitat.
  - Daily distances to aim for:
    - smallmouth 1–9 km/day, 483 m/h mean (PPSP:484); EMG 27 km/day ≈ 1 BL/s (FMG:62–67);
    - perch 46–98 m/h (PPSP:182, FMG:48);
    - white sucker 2.1–3.2 km/day (WSSB:274–278);
    - pumpkinseed home range 0.23–1.12 ha (FMG:19).
  - **Not in the notes:** search or clearance volumes, numeric reactive distances, bites per minute. These are calibration knobs to tune against the rations: perch 5.5–6.7 %BW/day in July (FZC:481), panfish 1–2 %/day (FZC:473–475).
- **Coarse mode.** Keep the footprint as the *coarse integrator*. Its radius becomes the distance the fish covers in the step, min(home range, v_cruise·dt·tortuosity), instead of the fixed 4–20 m.
  - At dt 900 s and a mean of 0.1–0.3 m/s, a fish swims 90–270 m.
  - Those are *world* metres, because fish swim at real speed through the 1/10 world. With tortuosity the radius is tens of metres, larger than today's 4–20, and capped by the home range.
  - This is risk 5 again.

### B3. Predation on young-of-year as "feeding bouts" (`FRY.ATTACK`, `FRY.CATCH`)

- **Where:**
  - `_eatYoy`, fish3.js:971–988. The mean taken is FRY.ATTACK·TS·capture·vuln·size·density·closeness·perf·dt for piscivores, or FRY.CATCH·TS·(dt/FEED.HANDLE)·density·perf for larva eaters (980). Then poissonish (981), with reach `YOY_EAT_R` 0.6 m + L (974).
  - Young piscivores eating other young: 1072.
  - Config: `FRY.ATTACK` 100 young/2-D-s (config.js:229: "one behavioural second is ~5 h of the fish's day"); `FRY.CATCH` 0.03 per handling slot (227).
- **Why:** the 2-D design assumed the predator spends a whole calendar step at the school. The scaling is calendar-consistent (× TS), but the *encounter* is judged at one instant.
- **Real time (fine).** A predator at a school (within reach now) catches at the real *in-bout* rate. The calendar mean 100·TS = 0.0057/s × success (~2–3/h for a bass) is the wrong number here, because the predator is at the school only seconds to minutes. Make it events (as B1) at a bout rate of one strike per few seconds while engaged, success × the school's thinning (`N_HALF`) and cover.
  - Population targets: young bass ate 58–93 % of littoral bluegill fry (FFE:651); ~303,000 juvenile bluegill a year eaten by piscivores in a companion lake (FFE:184).
  - Larvae eaten by planktivores (`CATCH`): events when a larva-eater's footprint overlaps a larval school.
- **Coarse mode.** Today's form is the coarse form: a bout rate × the time the predator's habitat block overlaps the school's.

### B4. Young-of-year schools move "on the physiological clock"

- **Where:** fish3.js:84 (`YOY_BL` 4 BL/s, `YOY_VMAX` 0.25 m/s); movement 1005–1010; target choice every tick (`_yoyTarget` 1038–1060: up out of low O₂, the richest food among the neighbour columns, else a random 6-m wander).
- **Why:** with 9.9 s of swimming per calendar day, a larva moved ~0.4 m a day (HOT_BROOK_3D.md:208). On the real-time clock the same speed would carry a school up to 21 km a day.
- **Real time.** Separate local milling (at BL/s, view only) from *net displacement*, a drift toward the target at a speed calibrated to observed dispersal:
  - age-0 smallmouth a mean 88 m from the nest by September, within 200 m (PPSP:572);
  - perch larvae reach the limnetic zone within 2 weeks of hatch (PPSP:242);
  - age-0 perch rise into the water column at night (~1/m³ at night vs 3 % of that by day, PPSP:266): a diel vertical move.
  - Larval swim speeds are not in the notes.
  - Re-target every few minutes (not every step), and by light (D).

### B5. Dusk and dawn moves at the 30-min sustained speed

- **Where:**
  - fish3.js:682–686: "the dusk hour is ~5 s of the sim's day". The trip thrust is ≥ trip·sustain/sprint.
  - The habitat blend by `e.sun` (`_mode` 463–476).
  - Today a dusk move is partial: ~15 m of a night's 50 s (HOT_BROOK_3D.md:192).
- **Real time.** Move at cruise speed over the real transition, 30–90 min.
  - Smallmouth rise "soon after sunset", shallowest 23:00–03:00, and go down "soon after sunrise", deepest 06:00–13:00 (PPSP:578–579).
  - Perch inshore at dusk and dawn (PPSP:253).
  - White perch 4–9 m deep by day, 0.9–1.2 m at night (WSSB:47).
  - Trigger by the light at the fish's depth (lux), not the surface sun fraction: perch schools break up below ~100 lx (PPSP:39); bullheads are active below ~1 lx (WSSB:379).
  - Minutes after sunset are not in the notes (FMG:161).
  - Remove the "travel at sustained speed" override (685–686) once the clock is real.
- **Coarse mode.** The habitat-choice block places the fish in its night or day habitat, with the transition at the light threshold, interpolated over the step.

### B6. Trip limits: `MIGRATE_V`, `BROOK_NEAR`, `BROOK_RUN`, mate cue

- **Where:**
  - fish3.js:77–78 (`BROOK_NEAR` 60 m, `BROOK_RUN` 150 m, `MIGRATE_V` 1.2 m/s);
  - assigned once in `add()` 397–402 (only pumpkinseed within 60 m of the brook can summer in it, and only suckers within 150 m run up it);
  - the long-trip thrust 687;
  - `MATE_CUE` 76 / 166;
  - the spawning grounds `SPAWN3` sites 141–145, 330–342.
  - Reason given: "a fish swims at real speed through a compressed calendar" (HOT_BROOK_3D.md:230–234).
- **Real time.** Drop the distance limits. Any fish can make the trip; the share that does becomes a personality, as `brookie` is today:
  - pumpkinseed drift up an inlet March–June and stay in the pools all summer (654 fish; FMG:175–178);
  - suckers run at 11–13 °C, mid-April to early May (FMG:179–182), runs lasting about six weeks (SSB:215), with stream entry peaking at sunset (WSSB:330);
  - smallmouth home over 6.7 km in 1–9 days (PPSP:491–492);
  - smallmouth nest within 20 m of last year's nest (FMG:68).
  - Travel at sustained cruise (FMG:86–99: 0.22–0.51 m/s for 200 min) over hours to days.
  - Keep the traditional spawning grounds, which are real; reconsider the mate-cue radius once mates have a real two-week window.
  - See risk 5 (the 1/10 scale makes every trip 10× shorter).

### B7. Spawning rate `F3.SPAWN_RATE` 0.25/s

- **Where:** fish3.js:74; the hazard at 916; the mate search every decision (911).
- **Today:** a ripe fish on its ground with a mate spawns in ~4 sim s, about 10 h of calendar.
- **Real time.** A per-hour rate, gated by time of day:
  - white perch egg release peaks at dusk (WSSB:134);
  - sucker runs peak at sunset (WSSB:330);
  - pumpkinseed nest by day; repeat bouts over ~54 days, up to 16 bouts (HAB:77).
  - Compat value 2.85e-5/s.

### B8. Lifetime learning on the compressed clock

- **Where:** fish3.js:209–220 (`reinforce3`: dec = `LEARN.DECAY`·dt, linear); called per decision with dt·2 (514); the reward `ate` (809).
- **Today:** learning decays over 2 sim s (~4.9 h of calendar, but only 2 s of behaviour). A "meal" is an intake ≥ 1.2 % of the gut in one 0.2-s call.
- **Real time.**
  - Reward from **events** (a prey caught, a bite of zooplankton or worms, a strike that missed), or from the intake *rate* against a running expectation.
  - Memory time constant of hours to days (exponential decay, C3).
  - In coarse mode: reward from the block's intake against expectation.

### B9. Intake capped at the Cmax rate every second (`want`, Q = 1)

- **Where:**
  - fish3.js:749 (`want = cm·apt·W·dt/DAY`);
  - fish3.js:787 (`BENTHOS.Q`) and 799 (`PLANKTON.Q`), config.js:826 and 918, both 1;
  - young: 1067.
- **Why:** with feeding as a daily mean, the Cmax rate applied uniformly. Q > 1 made adults strip the zooplankton (config.js:918–922).
- **Real time.** Fish feed in bouts (perch 07:00–18:00, CPE:647; shiners within ~1 h after sunset, WSSB:168; bullheads at night, WSSB:379). Their *daily* intake is capped by gut capacity plus evacuation (FB4 Cmax).
  - The instantaneous cap must be handling-limited: Q ≈ 2–4 × the daily-mean Cmax rate. Predators keep 2–3× the digestive capacity they use (FZC:505).
  - Panfish digest 50 % of a meal in 5 h, 100 % in ~21 h at 18–23 °C (FZC:474).
  - **Order of work:** change this before or with D9 (diel feeding), or p collapses.

### B10. Shared foraging time between the bed and the open water (`SHARE`, `K_ZOO`)

- **Where:** fish3.js:61, 65, 779–784 (t ∝ f^4); the type III `K_ZOO` 60 µg/L.
- **Today:** a daily time budget split by the profitability of the two foods (Werner et al. 1983).
- **Real time (fine).** The split *emerges* from where the fish is (on the bed or up in the water), chosen by its brain and drives (the depth target already follows the food, 671). Remove `SHARE` in fine mode.
- **Coarse mode.** Keep `SHARE` as the block-level allocation, calibrated to the fine runs.

### B11. Surface insects "taken as met"

- **Where:** fish3.js:792–796 (no search time of their own); `LIT3.K_SURF` 0.02 g/m², justified by "a fish searching the surface sweeps hundreds of m² an hour" (littoral3.js:57–58); within `SURF_Z` 1 m.
- **Real time.** Intake from the columns the fish occupies near the surface, at a swept area × density. The hatch is diel (D17).

### B12. Crayfish as a weighted food response (`CR_PREF` 5)

- **Where:** littoral3.js:104–106, justified as "a bass meets several an hour and needs one or two a day"; `crayE` 299–308; `takeWeedCells` 337–346.
- **Real time.** Whole crayfish (~12 g) are discrete prey, like B1: events on the bed by night or day, with gape and success.
  - Crayfish choose cobble by day and spread evenly across habitats at night (IPP:58).
  - The design's 70/30 night/day share and the strike successes (HOT_BROOK_3D.md:393, 397) have **no source in the notes**: calibrate them.

### B13. The zooplankton's "daily round"

- **Where:** chem3.js:263–271. Each step, each oxic cell relaxes toward the column total in proportion to its algae + `FOOD0` (`P.MIX` 1.0 /2-D-s × TS).
- **Today:** the field holds the animals' *daily-mean* position.
- **Real time.** Replace with explicit diel migration (D12). Keep the food-weighted spread as the slow part.

### B14. `MISS_CD` after a kill (29 min)

- **Where:** fish3.js:843.
- **Meaning:** the 2-D "miss" refractory (0.1 s, config.js:98), applied after a kill and scaled by 1/TS to 29 min of calendar.
- **Real time.** A seconds-long refractory after a *miss*. After a kill, handling (seconds to minutes, rising with prey body depth: PIKE:48–51) and the gut. Pike evacuate a meal in ~48 h at 14–18 °C (PIKE:139).

---

## 4. Category C — time-step-dependent (24)

Today's dt for each item is the calendar time per call. Then: what breaks on the real-time clock at **dt = 60 s** and
**dt = 300 s** (fish or water as stated), and the fix.

| # | Process (where) | Today | At dt 60 s | At dt 300 s | Fix |
|---|---|---|---|---|---|
| C1 | **Fish movement**: explicit Euler, a straight step of spd·dt; blocked steps "stay put"; yaw += yawRate·dt (≤ 3 rad/s); `DRAG` min(1, 1.4·dt); pitch min(1, 3·dt) (fish3.js:698–713, 613–695) | 0.1 s: fine | 45-m hops across shores; measured mean displacement 45 m in 2.5 h (should be km) | 59 m in 12.5 h: fish stall at shores | Fine: dt ≤ 0.1–0.2 s. Medium: kinematic sub-steps of 0.1–0.25 s inside a 1-s step. Coarse: no kinematics; relocate within reach v·dt to the habitat choice (a path for goals) |
| C2 | **Brain cadence** `DECIDE_EVERY` 2 *steps* (fish3.js:36, 512) | 5 Hz at dt 0.1 | 1 decision per 2 min | 1 per 10 min | A period in seconds with an accumulator. Coarse: brains evaluate habitat options per block (§7, R3-g) |
| C3 | **Learning decay** linear, `dec = DECAY·dt` (fish3.js:210) | 0.1 per call | dec = 60: diverges, clipped at ±4 | same | 1 − e^(−dt/τ); event rewards (B8) |
| C4 | **Per-call crop caps** `PLANKTON.CROP` 0.3 (chem3.js:453, 477, 486, 492; littoral3.js:337, 343, 360, 370) with sequential fish order | 30 % of the exposed stock per call | callers earlier in the array get first pick; binds for schools | binds more | A two-pass allocation per cell per step (sum demands, scale by supply), or a rate cap: stock·(1 − e^(−c·dt)) |
| C5 | **Gut evacuation** `ev = min(gut, rate·dd)` (fish3.js:720) | dd 0.01 day | fine (0.0007 day) | fine | Exact exponential for the proportional part, robust to dt ≥ hours |
| C6 | **Exposure filter** `kx = min(1, dt·TS/τ)` (fish3.js:1155) | 0.1 | fine (τ = 2.4 h) | fine | Make it e^(−dt/τ) |
| C7 | **Fish O₂ draw** per step with max(0, …) (fish3.js:528; young 1018) | — | fine | fine; clamps only in anoxic cells (O₂ not budgeted) | Rate-limit by the cell's O₂, or count the shortfall as hypoxia |
| C8 | **Strike hazard** 1 − e^(−rate·ΣK): at most one kill per predator per call (fish3.js:834–835) | — | the cap binds | binds | B1 (events or Poisson λ·dt) |
| C9 | **Spawning hazard** (fish3.js:916); mate search on decision steps (911) | — | fine once B7's rate is real | fine | B7 |
| C10 | **Young-of-year**: movement every step (1005); ticks `YOY_TICK` (1011); `_eatYoy` poissonish mean ∝ dt (980–981) | tick 58 min | movement: 15-m hops at `YOY_VMAX` | 75 m | Tick in seconds per rung (fine 60 s, coarse = dt); B4 movement |
| C11 | **Explicit relaxations with clamps** in `_heat`: ice chill, bed heat (env3.js:327–328); mixed-layer relax `k = clamp(rate·dt, 0, 1)` (336–338); ice ± rate·dt (344–345) | k ≈ 0.08 | fine | fine (k < 0.03) | Exponential form; no change needed below ~1 h |
| C12 | **Transport CFL**: sub-steps ≤ `MAX_SUB` 4 (env3.js:47, 368–386); beyond that, *currents are slowed* (`transportScale`) | **throttled today**: cloudy ×0.67, rain ×0.28, storm ×0.12 (5-m grid, measured) | nSub 1, storm 2; no throttling | nSub 1–4; storm ×0.69 | Adaptive nSub up to ~12–16 and no throttling at dt ≤ 600 s; or semi-Lagrangian for coarse (PHY:425). Real time *fixes* today's gale throttling |
| C13 | **Horizontal mixing**, explicit (env3.js:450–458) | 0.017 per step | fine | fine; stable to Δt ≈ 26,000 s at 50 m (PHY:421) | none |
| C14 | **Vertical mixing** `kMix = clamp(MIX_RATE·dt, 0, 1)`, `kStrat = clamp(K_STRAT·dt, 0, 0.5)` (env3.js:486, 580) | 0.2 / 0.004 per step | 1 / 0.5 (A7 #1–2) | same | τ_mix: windrows within 5–10 min (PHY:43); convective w* 1–50 mm/s, so a 5-m layer overturns in ~0.5–1.5 h (PHY:123); under ice the layer deepens 0.5–3 m/day (PHY:310). Kz is not in the notes; use Kz/DZ² with the under-ice rate fitted to the winter O₂ gate |
| C15 | **Siphon loop** sub-steps ≤ 20 at 0.4·vmin (env3.js:477) | — | 1 step | 1 step | none |
| C16 | **Through-flow** every `THRU_EVERY` 3 updates, implicit (env3.js:48, 393) | — | fine | fine | none (stable at any dt) |
| C17 | **Algae**: explicit growth with mass-limited clamps; linear decay (chem3.js:171–198) | rate·dt ≈ 0.015 | fine | fine (≤ 0.02/step); keep env dt ≤ ~1 h so the diel light is resolved | none at ≤ 1,800 s |
| C18 | **O₂ clamp** [0, 1.5] (chem3.js:151); aeration clamp (383); zooplankton `MIX`/`AVOID`/`FLOOR` min(1, …) (226, 267, 273); `_sedimentOM` som·max(0, 1 − k·dt) (345); sediment P mins (321–328) | — | fine | fine | Exponential forms where a rate × dt can reach 0.5 |
| C19 | **Slow-pool batching** `CHEM3.SLOW` 3 (chem3.js:29, 140); `PL3.SLOW` 3 (plants3.js:43, 132); littoral every 3rd (littoral3.js:185) | 88 min | 3 min | 15 min; at env dt 1,800 s it is 90 min (= today) | Fine at any rung up to today's; make SLOW a time (e.g. 15 min) not a count |
| C20 | **Plants' per-step take cap**, "at most half of what each holds a step" (plants3.js:195–196) | — | fine | fine | Rate form if dt grows beyond hours |
| C21 | **Littoral per-step caps**: 0.5 of the organic layer or snails (littoral3.js:206, 221, 256, 258); fly/drown min(1, rate·dd) (231); mussel filtering f = min(0.5, Vc/vol) (280); last step's emergence lays this step's eggs (195–197) | — | fine | fine | Mussels: f = 1 − e^(−Vc/vol). The rest are fine until hours |
| C22 | **Merge, split and filter cadence in steps**: `MERGE_EVERY` 10 (fish3.js:87, 532); dead filter every 20 (533–534); `_o2Better` once a step (355) | 2.4 h | 10 min | 50 min | Seconds-based schedule: e.g. merge every 30 s in fine, every step in coarse |
| C23 | **Per-step light state for vision**: `zv` refreshed per env step (chem3.js:150, `_sight`) | per env step | stepwise dawn and dusk at env dt 300: fine | coarse at 1,800 s | Fish compute vision from the instantaneous light (they already do for `a.vis`, 506) |
| C24 | **Determinism across rungs.** The RNG stream depends on the step schedule (strikes, spawning, hazards, merges) | — | — | — | A run is deterministic given its rung schedule. Saves (not built in w3) must store it; switching rung mid-run changes the future (expected, and to be documented) |

Measured C1 evidence (`fishrt.mjs`, real-time clock, unchanged fish3):

| dt | ms per step | Mean displacement |
|---|---|---|
| 0.1 s | 27.9 | 2.6 m in 15 s |
| 1 s | 21.0 | 5.6 m in 150 s |
| 60 s | 20.6 | 45.5 m in 9,000 s |
| 300 s | 20.4 | 58.8 m in 45,000 s |

A real fish covers hundreds of metres to km over those spans.

Measured C12 (`cost.mjs`, 5-m grid; sub-steps and current scale by weather state, clear → storm):

| Env dt | Clear | Cloudy | Rain | Storm |
|---|---|---|---|---|
| Today (0.2 sim s = 1,752 s) | 3, ×1 | 4, ×0.67 | 4, ×0.28 | 4, ×0.12 |
| Real time 10 s | 1 | 1 | 1 | 1 |
| Real time 60 s | 1 | 1 | 1 | 2 |
| Real time 300 s | 1 | 2 | 3 | 4, ×0.69 |
| Real time 1,800 s | 4 | 4, ×0.65 | 4, ×0.27 | 4, ×0.12 |

On the 10-m grid today: 2; 4; 4, ×0.46; 4, ×0.22.

---

## 5. Category D — the day–night cycle and the calendar (20)

**Measured: what real time does to the diel swings.** `diel.mjs`, 5-m grid, mid-July (yf 0.38), clear weather, days 2–3
of a 3-day run. The real-time runs use the compat `MIX_RATE` and `K_STRAT` (A7).

| | Today (120-s day) | Real time, env dt 60 s | Real time, env dt 300 s |
|---|---|---|---|
| Shallow − deep surface T, day / night | +1.29 / −1.20 °C | +1.20 / −0.97 | +1.20 / −0.96 |
| Cove surface T swing | 5.23 °C | 2.43 | 2.42 |
| Cove surface O₂ swing | **12.9 mg/L (1.6–14.5)** | 5.2 (8.0–13.2) | 5.1 (8.1–13.2) |
| Basin surface O₂ swing | **7.9 mg/L** | 1.4 | 1.4 |
| Night siphon, per real second | 0.32 m³/s (world) | 0.30 | 0.30 |

These numbers support three conclusions:
- Env dt 300 s is converged against 60 s for the diel signal.
- The real-time swings are realistic: coloured lakes have an epilimnion range of 2.1 ± 1.0 °C (LLS:168), and weed beds go from 12–25 % saturation at dawn to 205–235 % in the afternoon (MAC:463).
- Today's are exaggerated ~2× in temperature and ~5× in open-water O₂, because each "day" integrates 12 calendar days.

| # | Where | Today | Real time |
|---|---|---|---|
| D1 | Time of day `t += dt/DAY_LEN` (env3.js:297); `isNight` (250); `light`, `lightDay`, `sun` (303–304) | a 120-s cycle | 86,400 s: a real day. `DAY3` = `DAY_LEN`: the physiological day and the diel day become one, and the rule "the day–night cycle only modulates, its totals scaled" (HOT_BROOK_3D.md:30–35) disappears |
| D2 | Day length and noon height `seasonalSun` (env3.js:56–59), duplicated as chem3.js:65 `sun()`; `SEASON.DAY_FRAC`, `NOON` (config.js:381–383) | — | Carries; deduplicate |
| D3 | Night convection: `mixDepth()` jumps to `NIGHT_MIX_M` 6 m at night (env3.js:272–276) | instant at sunset; fully mixed within the night | Develops over hours after sunset (w* 1–50 mm/s, PHY:123); fine once τ_mix is real (C14) |
| D4 | Diel heating target `diurnal = sin(2π(t − 0.30))`, amplitude by mixed depth (env3.js:320, 333–335) | relaxation ≫ diel: swing ≈ target | Relaxation 3–12 h, comparable to the day, so the swing shrinks and lags (measured 5.2 → 2.4 °C in coves). Realistic now. Later: a heat budget (shortwave by hour − losses over the mixed depth) instead of relax-to-target |
| D5 | The `TEMP_RELAX` coupling (env3.js:336) | — | Deep columns (M ≥ 2.5 m) barely swing (e-fold 12 h); re-check the gate's diel check (still passes in the experiment) |
| D6 | Ice melt counts the afternoon's warmth (env3.js:343–344) | half of each "day" | Afternoon melt, night refreeze: carries; re-check ice-out (gate: yf 0.13–0.2) |
| D7 | Night siphon gated by `isNight && calm` (env3.js:459–463) | each night = 6 days of siphon | Rotsee: initiation ~3 h (late summer) to ~20 h (winter); the daily maximum usually *in the morning*; flushing ~7–20 h; on 37 % of days (PHY:105–115). Drive it by the cove–basin density difference with a spin-up, not the night flag |
| D8 | Wind fixed per weather spell; the circulation switches instantly when the spell changes (env3.js:254–267, 358–361) | — | Add the spin-up toward the wind equilibrium over 5–10 h (PHY:80; HOT_BROOK_3D.md:75; gyres reversed in ~6 h, PHY:34). Optional diel wind (calm nights). Seiche ~19 min (PHY:70): not stepped (PHY:428) |
| D9 | **Visual feeding by the day's noon light**: `_sight` (chem3.js:113–119), `zooVis` (412–417), fish3.js:491, 507 (`visDay`), 523, 751, 816 | "a sim day stands for ~12 real days" | Instantaneous light at depth: diel feeding emerges (perch 07:00–18:00, CPE:647; shiners within ~1 h after sunset, WSSB:168; pumpkinseed night strikes > 75 % of day's, PPSP:721–723; bass success by lux, PPSP:90–91). **Needs B9 first** |
| D10 | Senses already use the instantaneous light `a.vis` (fish3.js:506) while feeding uses `visDay` (507) | inconsistent | Unify on instantaneous |
| D11 | Algal O₂ by the instantaneous light (chem3.js:176, 187, 198); respiration fully active if the day-peak light at depth > `RESP_IK` (166) | swings 5× too big (table above) | Realistic; the redox P switch (`SED_P.O2_THRESH`, chem3.js:327), the zooplankton O₂ floor (246–247) and hypoxia exposure all see smaller swings. Re-calibrate (R4) |
| D12 | **Zooplankton diel vertical migration as a daily mean**: `_migD`/`_migC` (chem3.js:221–222), `zooExposed` with `TWILIGHT` (420–423), `DVM_*` (config.js:896–905), the daily round (B13) | migrants "meet fish only at twilight" (a mean) | Explicit diel movement between layers or into the weeds: dusk ascent, dawn descent. Swim speeds and timing are *not in the notes* (ZOO:444); amplitude needs ≥ ~6 m (ZOO:424–426), so in 3–5.5-m lakes the **weed refuge** dominates (daphnids pack 2-m beds by day, leave at night: MAC:413; no horizontal migration in 31 lakes: MAC:421). Fish exposure then emerges from co-location |
| D13 | Dormancy and hatching by day length (chem3.js:224, 256) | calendar | Carries |
| D14 | Periphyton by the instantaneous light (chem3.js:344) | — | Carries |
| D15 | Plants: growth on `lightDay` (plants3.js:139, per day: fine); O₂ "now" = light / (lightDay·`DAY_MEAN` 0.4) (214; config `PL3.DAY_MEAN` 61) | approximation | Compute the real day-mean light (the integral of the day), not 0.4 |
| D16 | Crayfish out by night: `isNight`, `CR_OUT` [0.3, 0.7] (littoral3.js:83, 303, 317, 328) | a step switch | Ramp by light; the shares are unsourced (B12) |
| D17 | Emergence and terrestrial fall-in spread evenly over the day (littoral3.js:194, 212, 230–235) | — | Hatch at dusk (Hexagenia "near dusk", IPP:246–250; pupae rise at dusk and night, LIT:371). The diel pattern of fall-in is not in the notes (keep flat) |
| D18 | Fish habitat mode blends day and night by `e.sun` (smooth 0.02–0.3) and winter by temperature (fish3.js:463–476) | the dusk blend lasts ~5 s | Transitions over ~1 h; trigger by lux at depth (B5) |
| D19 | Spawning has no time of day (fish3.js:909–929) | — | Dusk or night for white perch and suckers; day for sunfish (B7) |
| D20 | The calendar `yearFrac` windows: `SPAWN.SEASON_END`, `FRY.SPRING_YF`, `LEAF_YF`, `FALL_YF`, `MU_YF`, `CR_RELEASE_YF`, `PL3.YF_STORE`, `_brookSeason`; date jumps (env3.js:279–291; plants3.js:106–120; littoral3.js:154–168) | — | Carry. The season-jump buttons (sim3worker.js:84) still work |

---

## 6. The cost model

### 6.1 Measured per-step cost

These are the measurements behind the summary's per-step table. Node, this machine (12 logical cores, one used), seed 901/911/921, mid-July unless noted.

**`Env3.step` on the default 5-m grid** (2,671 columns, 15,663 cells, 29,365 face-layers, 13 transported fields, 3,445 bed cells):

| Clock, env dt | Total | heat | chem | plants | littoral | transport |
|---|---|---|---|---|---|---|
| Today, 0.2 sim s | **15.4 ms** | 0.20 | 4.84 | 0.89 | 0.48 | 8.97 (3 sub-steps) |
| Real time, 10 s | 9.5 | 0.18 | 3.92 | 0.69 | 0.38 | 4.34 (1) |
| Real time, 60 s | 10.1 | | | | | 4.67 |
| Real time, 300 s | 11.0 | | | | | 5.26 |
| Real time, 1,800 s | 14.7 | | | | | 9.17 (4) |

The w3 gate's cost check (≤ 12 ms) failed once at 15.5 ms while these measurements shared the CPU. The fish's cost check passed.

**`Env3.step` on the 10-m grid** (685 columns, 4,009 cells; the gate's long runs): 3.3 ms. The chem year in the gate: 18,000 steps in 59 s.

**`Fish3.step`**, ~3,080 agents / ~16,500 fish:
- July, with ~330 young schools: **24.4 ms**.
- January-like (yf 0.9), no young: **18.8 ms**.
- With the 5-m grid's water: 28.6–29.0 ms.
- Under the real-time clock, unchanged code: 20.4–21.0 ms at dt 1–300 s, and 27.9 at 0.1. **The per-step cost does not depend on dt.**

Breakdown (July, `fishparts.mjs`, ms per step):

| Part | ms/step | Calls/step | Group |
|---|---|---|---|
| `_sense` | 3.00 | 1,542 | locomotion and decisions |
| `_brain` | 2.63 | 1,542 | locomotion and decisions |
| `_drive` | 3.23 | 3,083 | locomotion and decisions |
| `_move` | 0.60 | 3,083 | locomotion and decisions |
| `_feed` (incl. `_strike` 0.09 and `_eatYoy` 0.46) | 3.89 | 1,542 | biology |
| `_energetics` | 2.30 | 3,083 | biology |
| `_hazards` | 0.68 | 3,083 | biology |
| `_spawn` | 1.79 | 1,395 | biology |
| `_stepYoy` | 0.27 | 1 | young |
| hashes | 0.14 | | |
| loop body (mode, vision, cell look-ups) | ~5 | | |

Locomotion and decisions total **9.4 ms**; biology totals **8.7 ms**.

**A coarse step**, without senses, brain, drive or move, but with a habitat-block placement: estimated **~13 ms** (≈ 24.4 − 9.4 − the loop's share, + placement). Medium (dt 1 s, brains 1–5 Hz, kinematics ×4 at 0.25 s): estimated **~40 ms per step**.

### 6.2 Wall clock per simulated day and year (single thread)

**Fish:**

| Fish dt | Steps/day | Full step (22 ms): per day | Per year | Coarse step (13 ms): per day | Per year |
|---|---|---|---|---|---|
| 0.1 s | 864,000 | 5.3 h | 80 days | — | — |
| 1 s | 86,400 | 32 min | 8.0 days | medium (~40 ms): 58 min | 14.6 days |
| 10 s | 8,640 | 3.2 min | 19.3 h | 1.9 min | 11.4 h |
| 60 s | 1,440 | 32 s | 3.2 h | 19 s | 1.9 h |
| 300 s | 288 | 6.3 s | 39 min | 3.7 s | 23 min |
| 900 s (today's gate) | 96 | 2.1 s | 13 min | 1.25 s | 7.6 min |

**Water:**

| Env dt | Steps/day | 5-m grid: per day | Per year | 10-m grid: per day | Per year |
|---|---|---|---|---|---|
| 1 s | 86,400 | 14 min | 3.5 days | 4.3 min | 1.1 days |
| 10 s | 8,640 | 82 s | 8.3 h | 26 s | 2.6 h |
| 60 s | 1,440 | 14.5 s | 1.5 h | 4.3 s | 26 min |
| 300 s | 288 | 3.2 s | 19 min | 0.9 s | 5.3 min |
| 1,800 s | 48 | 0.7 s | 4.3 min | 0.16 s | 1.0 min |

**Rungs together** (5-m grid unless noted):

| Rung | Fish dt | Env dt | Per sim day | Per sim year | Speed vs real time |
|---|---|---|---|---|---|
| Watch | 0.1 s, brains 5 Hz | 60 s | 5.3 h | 80 days | **4.5× max** (1× costs 22 % of a core) |
| Medium | 1 s (sub-stepped) | 60 s | ~58 min | ~15 days | ~25× |
| Coarse-60 | 60 s | 60 s | 33 s | 3.4 h | ~2,600× |
| Coarse-300 | 300 s | 300 s | 6.9 s | 42 min | ~12,500× |
| Gate (10-m grid) | 900 s | 1,800 s | 1.4 s | 8.6 min | ~60,000× |

The human asked for "~800× or more" (a year in ~11 h): coarse-60 is already ~3× faster than that. Evolution at coarse-300: 100 years ≈ 70 h of running. One option is to make watching cheaper with *fidelity by region*: fine near the camera, coarse elsewhere. But then the sim depends on where the camera looks. That breaks the render/sim separation, unless the camera path is logged as an input. If used, the coarse mode must be statistically equivalent to the fine one; otherwise keep fidelity global.

### 6.3 What the w3 gate needs

Today's `test/w3.mjs` (69 checks) was timed in this session: **763 s (12.7 min)**, partly while sharing the CPU with
these measurements. `gate_timing.txt` has per-line timestamps. Section times:

| Section | Time |
|---|---|
| Environment and transport | 173 s |
| Chemistry | 61 s |
| Fish core | 96 s |
| Reproduction | 123 s |
| Food web | 243 s |
| Plants | 67 s |

Its long runs, with the cost on the real-time clock at two rungs:

| Check (test/w3.mjs) | Run | Sim time | Today | At fish 900 s / env 1,800 s | At fish 300 s / env 300 s |
|---|---|---|---|---|---|
| 110–118 residence | env 5-m | 60 days | 34 s | ~45 s | ~190 s |
| 120–125 diel swing | env 5-m | 2 cycles (24 days today) | 36 s | 2 days: ~6 s (env 300) | ~6 s |
| 128–131 summer mixing | env 5-m | 3 cycles (36 days today) | 54 s | 3 days: ~10 s (env 300) | ~10 s |
| 133–142 ice | env 5-m | ~62 days | 36 s | ~45 s | ~200 s |
| 144–151 siphon | env 5-m | ~1.5 days | 10 s | ~2 s (env 300) | ~2 s |
| 184–206 chemistry year | env 10-m | 365 days | 59 s | ~60 s | ~5.3 min |
| 230–245 day and night | fish + env 10-m | 14 days today | 28 s | needs fine/medium around dusk: see below | |
| 299–309 summer month | fish + env 10-m | 32 days | 65 s | ~45 s | ~2.5 min |
| 322–340 spring | fish + env 10-m | 62 days | 123 s | ~87 s | ~4.7 min |
| 422–452 food web | fish + env 10-m | 120 days | 243 s | ~2.8 min | ~9.2 min |
| 477–560 plants | env 10-m | 1.25 years | 67 s | ~75 s | ~6.5 min |

**Totals:** ~11 min at fish 900 s / env 1,800 s (about today's 12.7); **~37 min at 300 s/300 s**.

**Behaviour checks in real time.** The day-and-night check (and any future check of strikes, schooling or dusk moves) needs fine or medium steps around dusk. A real dusk move takes 30–90 min. Fine for 1.5 h is 54,000 steps × 22 ms ≈ 20 min, too long. Medium for 2 h is ~5 min. So run these checks on a **reduced scene**: one or two species, or a sub-area, ~300 agents, so fine for 1.5 h is ~2 min. Reach dusk at the coarse rung first.

**The R4 gate rung:** fish ≈ 900 s, water ≈ 1,800 s (adaptive transport sub-steps). That is today's calendar resolution, which makes the gate cost-neutral. Equivalence (coarse 900 vs 60–300 vs fine windows) and ≥ 3-seed re-calibration go to a **separate long suite**; SESSION_STATE already suggests one.

---

## 7. Recommended order of work

### R2 — the clock (keep everything working; a refactor first, then physics)

1. **Compat refactor (no behaviour change).**
   - Set the real-time constants in clock3 and add `PER2D` (A0).
   - Convert every A7 item to its compat value: `MIX_RATE` 1.14e-4/s, `K_STRAT` 2.28e-6/s, `YOY_TICK` 3,504 s, `ATTACK` 2.28e-4/s, `SPAWN_RATE` 2.85e-5/s, `LEARN.DECAY` 5.7e-5/s, the meal threshold by calendar dt.
   - Give `Fish3.step` two times, **(dtBio, dtMove)**, and run it at **(876 s, 0.1 s)**: today's sim on a real-time clock. Today a fish swims 0.1 s per 876 s of calendar, and this keeps it so.
   - Run the env at 1,752 s.
   - Rewrite the gate's literals in days (A7 #8) and the worker's steps (A7 #9).
   - Expect results identical up to floating point. **This catches every landmine.**
   - Risk: medium. It is mechanical but wide; the gate is the check.
2. **Exponential integrators:** C3, C5, C6, C11, C14 (kMix, kStrat), C21 (mussels).
3. **Transport:** adaptive sub-steps and no gale throttling at env dt ≤ 600 s (C12); the wind spin-up of 5–10 h (D8).
   - Risk: today's throttling hides 3–8× weaker wind exchange in 3 of 4 weather states. Removing it changes O₂, P retention and plankton.
   - A/B on 3 seeds over a year without fish (P retention 0.5–0.9; ice-out; winter O₂; diatoms).
4. **Real mixing times:** τ_mix (hours, convective) and Kz/DZ² below the mixed layer and under ice (C14), fitted to the winter O₂ gate.
5. **Diel physics:**
   - the siphon by density difference with spin-up (D7);
   - heat (D4 and D5; at least re-check);
   - the day-mean light for the plants (D15).
   - A/B the diel and env gate checks at env dt 300 and 1,800.
6. **Decide the env rungs:** 60–300 s for watching and coarse; 1,800 s for the gate if the A/B shows 1,800 vs 300 agree on the year's budgets.

### R3 — the fish: real mechanisms and the fidelity ladder

- **a. Decouple time.**
  - Kinematic sub-steps (C1).
  - Brain cadence in Hz (C2).
  - Seconds-based schedules for merges, ticks and filters (C10, C22).
  - The fine rung (0.1 s) must reproduce today's movement checks.
- **b. Intake cap first (B9).** Handling-limited bouts, Q 2–4. Then **diel senses and feeding** (D9, D10) and **explicit DVM / the weed refuge** in chem3 (D12, B13). **Risky:** p, zooplankton peaks, starvation and young growth all move. 3-seed A/B against stage 7d.
- **c. Local foraging** (B2, B10, B11) in fine mode. The footprint becomes the coarse integrator (radius from v·dt).
- **d. Predation as events** (B1, B3, B12, B14) in fine mode, and as encounter integrals in coarse mode. Calibrate the attack and detection parameters to the rations and empty-stomach shares (B1 numbers), because per-hour attack rates are not in the notes.
- **e. The young:** real displacement and diel moves (B4), predation events (B3).
- **f. Trips:** remove the distance limits; multi-day runs at sustained cruise; spawning by the hour and time of day (B5–B7).
- **g. The coarse rung and the brains — DECIDED (human, 2026-10-16): option 1, "the brain decides per block".** Each coarse
  block the fish's own network decides — where to go next, how hard to forage, how much to hide — from what it senses at
  the block's scale; the same network as in real time, so learning and evolution keep acting on it. The options were:
  1. Each coarse block, evaluate the brain on a few candidate habitats (its inputs at each), and choose by its outputs. Evolution then still acts on the brain, at extra cost.
  2. Interleave medium-fidelity "sample hours" (e.g. one dusk in seven), with fitness and learning from those.
  3. Coarse mode is innate drives only, and brains evolve only at fine/medium.

  Pick one before building the ladder. Then build the **equivalence harness**: the same seeds; fine windows (reduced scene) vs medium vs coarse-60/300/900. Compare:
  - daily intake per species;
  - kills per predator per day;
  - diel depth and distance-to-shore histograms;
  - growth;
  - the young's fates.
- **h. The scale question — DECIDED (human, 2026-10-16): option 1, accept it.** Real speed everywhere; trips, dusk moves and
  home-range crossings take 1/10 of their real time; encounter rates stay real. In real time, fish at real speed cross the 1/10 lakes 10× faster than real lakes. Encounter rates stay real, because local densities are real. Trips, home ranges and dusk moves do not. Options:
  1. Accept it.
  2. A "travel pace" × GEO.SCALE for the geographic moves.
  3. A larger scale (1/5: 26 ha, ~69,000 fish; HOT_BROOK_3D.md:22–26). Cost ~4×.

### R4 — the gate

- Every run in days, at a named rung.
- The long runs at fish ~900 s / env ~1,800 s (≈ 11 min, §6.3).
- Behaviour checks on reduced scenes in fine/medium windows around dusk.
- Re-calibrate on ≥ 3 seeds after R2-3/4/5 and each R3 step. Judge it by the young-of-year fate audit and the budgets, not adult counts alone.
- A separate long suite: equivalence across rungs, multi-seed years.
- New perf checks: the fine step ≤ 25 ms, the coarse step ≤ ~15 ms, the env at 300 s ≤ ~12 ms.

### R5 — the worker and the view (notes only)

- `sim3worker.js` steps fixed 0.1 s / 0.2 s (22–29). It must step by rung, with a speed → rung table, and send positions that may jump at coarse rungs (the view must hide teleports).
- The clock display (main3.js:512) becomes real hours.
- The ½× button (HOT_BROOK_3D.md, SESSION_STATE) becomes just a speed.

### The risky items, in one list

| Risk | Where |
|---|---|
| Coarse/fine equivalence and the brains in coarse mode | R3-g |
| The diel recalibration (O₂ swings 5× smaller; feeding by the hour) | D9–D12, B9 |
| Q / bout intake before diel feeding | B9 |
| The 1/10 scale | R3-h |
| Gale throttling removed | C12 |
| The hidden A7 rates | caught by the compat refactor |
| The gate's time budget | §6.3 |
| Unsourced crayfish shares and strike successes | B12 |
| No field numbers for attack rates, search volumes, DVM timing or Kz | they become calibration knobs, judged on rations, empty stomachs and the O₂ gates |

---

## Appendix A — method and scratch files

- **Reading:** clock3.js, env3.js, chem3.js, plants3.js, littoral3.js and fish3.js were read in full. Also read: the config blocks they use (TIME, SPAWN, FEED, BIOE, FRY, PREY, BROOD, SEASON, ICE, THERMAL, WIND, TURBIDITY, DIATOM, PHYTO, CYANO, ENV, NUTRIENT, SED_P, NCYCLE, MICROBE, SEDOM, BENTHOS, PLANKTON, ACTION, MOTION, DRIVE, LEARN, BRAIN), the time parameters in species.js, test/w3.mjs and sim3worker.js. geometry.js has no time dependence.
- **Scripts** (`C:\Users\james\AppData\Local\Temp\claude\w3audit\`):
  - `cost.mjs`: the env's parts and the transport sub-steps per weather state; the fish step.
  - `zoocheck.mjs`: test/w3.mjs's June zooplankton check, run alone to read its numbers.
  - `fishparts.mjs`: the fish step by method.
  - `fishrt.mjs`: the fish under the real-time clock at dt 0.1–300 s.
  - `diel.mjs`: diel swings, today vs real time.
  - `rt/src`: a copy of `src/` with `CLOCK3` = real time. For `diel.mjs` the copy also has `MIX_RATE` and `K_STRAT` ÷ 8,760; `cost.mjs` was run before that change.
  - `gate_timing.txt`: `test/w3.mjs` with timestamps.
- **The w3 gate run used for the timings** (the working copy just before da8bd4b; 69 checks): 67 PASS, 2 FAIL.
  - The env-cost check ("a few milliseconds", < 12 ms) read 15.5 ms while the other measurements shared the CPU.
  - The June zooplankton check failed: a peak of 322 µg/L, with fish taking 50 % of June's production against the then-threshold < 50 % (re-run alone: `zoocheck.mjs`). da8bd4b, committed during this audit, raised the threshold to < 65 % because the mussels take part of the zooplankton's algae, so it passes there. Neither failure bears on the timings.

## Appendix B — research-note abbreviations used above

All under `docs/research_notes/`:

| Abbreviation | File |
|---|---|
| PHY | Whole lake 3D fish simulation/shallow_lake_3d_physics.md |
| FMG | Whole lake 3D fish simulation/fish_movement_and_groups.md |
| HAB | Whole lake 3D fish simulation/habitat3d.md |
| MAC | Whole lake 3D fish simulation/macrophytes.md |
| LIT | Whole lake 3D fish simulation/littoral_invertebrates.md |
| PPSP | Seasonal fish habitat use/perch_pickerel_smallmouth_pumpkinseed.md |
| WSSB | Seasonal fish habitat use/whiteperch_shiner_sucker_bullhead.md |
| PIKE | Real lake ecology for calibration/northern_pike.md |
| LMB | Real lake ecology for calibration/largemouth_bass.md |
| FZC | Real lake ecology for calibration/fish_zooplankton_coupling.md |
| FFE | Real lake ecology for calibration/forage_fish_early_life.md |
| ZOO | Real lake ecology for calibration/zooplankton_dynamics.md |
| WLE | Real lake ecology for calibration/whole_lake_energy_flow.md |
| CPE | Maine lakes ponds and streams/centrarchid_percid_esocid_parameters.md |
| SSB | Maine lakes ponds and streams/sucker_shiner_bullhead_trout_parameters.md |
| IPP | Hot Brook populations and water/invertebrates_plankton_plants.md |
| LLS | Maine lake shores and catchment/land_lake_subsidies.md |
| ECO | docs/ECOLOGY_RESEARCH.md |

**Not in the notes** (calibration knobs, to be judged on observed outcomes):
- per-hour attack rates and field strike success;
- fish search or clearance volumes, reactive distances, bites per minute;
- larval swim speeds; per-predator kills of larvae;
- zooplankton DVM timing and swim speeds;
- Kz and the mixed-layer mixing time;
- open-water diel O₂;
- the crayfish day/night split;
- the minutes after sunset of the dusk migration.
