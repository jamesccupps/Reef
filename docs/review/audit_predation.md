# Audit: predation — what was adjusted away from reality, and what it stood in for

Written 2026-10-21 for the human's instruction: "make sure there aren't other things that were adjusted but shouldn't have been because they
weren't realistic … the real solution is to make it realistic and provide everything the environment has". Read-only on code.

**Scope.** The encounter–strike–capture rule (`src/w3/fish3.js` `_strike2`, GPU `src/w3/gpu/wgsl.js` `k_strike`) and everything that limits or
boosts it: `F3`, `PRED3`, `CS3`, `SPINY3`/`PPR0`, `S3` refuge fields, `stageR5()`, the hunger gate, the young-of-year predation (`_yReq`, `FRY`),
and the species' gape and piscivory fields (`src/species.js`, `src/w3/species3.js`).

**Evidence used.**
- Code, `git log -S` / `git show` for every parameter, commit messages, `docs/HOT_BROOK_3D.md` §4, `docs/FINDINGS.md`, `docs/review/*.md`, `SESSION_STATE.md`.
- Research notes (handles as in `docs/review/predators.md`): **PEA** `Real lake ecology for calibration/piscivore_encounter_attack.md`, **PFF** `…/piscivore_field_feeding_rates.md`, **WPH** `…/white_perch_habitat_and_predation.md`, **RTF** `Whole lake 3D fish simulation/realtime_foraging.md`, **WBS** `…/weed_bed_structure.md`, **H3D** `…/habitat3d.md`, **YPF** `…/young_piscivore_functional_response.md`.
- Probes already run today (1/10 CPU, seed 509, `stageR5`): scratchpad `prd2_509.txt`, the screen `scr_A…F`, `scr_P1…P6`.
- GPU arm V year-1 tallies (true scale, seed 613): scratchpad `r14V_613.txt` lines 880–960.
- **New in this audit** — a true-scale CPU snapshot of the strike rule's terms (scratchpad `audit/prdT.mjs`, `prdT2.mjs`, `prdT3.mjs`; HB_WORLD=true, seed 509, mid-July, 8–49 blocks of 1,752 s from founding; one seed, one day: a snapshot, not an equilibrium).

**Classes.** **REAL** set from data and still right · **COMP** compensation: moved away from the field value to fix a symptom ·
**STACK** a limit now redundant with (or double-counting) another rule · **PRIOR** a guess with no source · **LEGACY** inactive under `stageR5`.

---

## 1. How the terms multiply today

A predator's kill probability in a step is P = 1 − exp(−S · c̄ · perf · act · dt), with S = aMax · E/(E + E_h), E = π·RD²·(ENC_U + v)·N
(N = the catchable fish within ENC_R 6 m, each × concealment × (1 − cover) × the shallows term × the ENC_DZ term, per m³ of the column) and
c̄ the encounter-weighted capture success (CS3 × (1 − PPR/PPR0) × school term × (1 − cover) again under COVER_CS) — `fish3.js:1924–1954`,
`wgsl.js:996–1048`.

| Term | Pickerel | Bass | Where measured |
|---|---|---|---|
| Calls with no fish within 6 m | 1 % | 1 % | true scale (prdT) |
| Calls with fish but none catchable | 44–45 % (51 % of the fish too deep-bodied for the gape, 5 % too long, 18 % of the rest no gut room) | 56–57 % (75 % too deep, 7 % too long) | true scale (prdT, prdT3) |
| Calls whose catchable fish are all refuged | 1 % | 1 % | true scale |
| Calls with no candidate (all three) | 60–68 % | 79–82 % | 1/10 CPU (prd2) |
| Saturation E/(E + E_h) when prey present | 0.34–0.45 (true) · 0.12–0.17 (1/10) | 0.45–0.50 (true) · 0.16–0.22 (1/10) | |
| ENC_DZ kept / (1 − cover) / shallows, over catchable prey | 0.78 / 0.80 / 0.85 | 0.74 / 0.89 / 0.83 | true scale (prdT2) |
| Capture: CS0 → × size term → × cover, school | 0.49 → 0.30 → 0.18–0.20 | 0.55 → 0.33 → 0.14–0.16 | true scale (prdT2); 1/10: 0.07–0.13 |
| act (share of time "hunting"), mean over calls | 0.10–0.15 | 0.15–0.20 | both |
| Kills per fish-day | ~0.35 one day from founding (true) · 0.06 GPU year mean (202,389 kills, ~9,000 fish) · 0.04–0.08 (1/10) | ~0.18 (true, founding) · 0.01–0.03 (1/10) | field 0.4–0.8 pickerel, ~1 bass (PFF §2) |

The design (PEA (c), PFF diagnosis 1) assumed **E ≫ E_h everywhere a predator lives**, so that aMax and the hunger gate would set the rate.
The sim runs at E ≈ E_h or below, so every factor inside E now acts linearly, and the brakes added while E ≫ E_h (act, the bass aMax cut)
now multiply with them.

---

## 2. The parameter table

### 2a. The encounter–strike–capture rule

| Parameter | Now (default → stageR5) | Field value + source | History | Class | Still needed? | Restore to | Missing mechanism it stands in for |
|---|---|---|---|---|---|---|---|
| `F3.STRIKE2` (`fish3.js:105`, `stageR5` `:456`) | 0 → 1 | structure from PEA (c): encounter → saturating strikes → capture | db0d08e (pickerel 0.78 kills/day in a 1/10 June month, white and yellow perch its 2nd/3rd prey, before any later brake) | REAL | yes | — | — |
| `F3.ENC_R` (`:106`) | 6 m | no source. RD is 1.0–1.2 m (PEA (a)); the relevant scale is RD + prey displacement over the decision interval | db0d08e | PRIOR | as a density window, yes | ~2–3 m with a distance kernel, or keep 6 m and drop ENC_DZ | Fine-scale habitat structure (edges, isobaths); a 6-m snapshot of point-agent schools is patchy (3–23 % of pickerel calls with prey had E < 3 /h at true scale) |
| `F3.ENC_U` (`:107`) | 0.1 m/s, constant | perch-sized prey 0.05–0.15 m/s (PEA (c)); roach cruise 0.1·e^(0.15T) (Nilsson-Örtman 2026, PEA Add. 2) | db0d08e | REAL (value) / PRIOR (constant) | yes | the prey's own speed or activity; × temperature | Diel prey movement: the dusk inshore pass and school break-up (Helfman 1979; Major 1977) raise encounters exactly when piscivores hunt |
| **`F3.ENC_EH`** (`:108`) | 30 /h | **"no field value"** (PEA (c), PFF (c)). Holling-consistent form S = E/(1 + h·E) gives E_h = 1/h = aMax | db0d08e; chosen so "strikes fall off only at ≲ 0.03 fish m⁻³" — the design's littoral 0.5–2 fish m⁻² | **PRIOR** (load-bearing) | yes, the form | **E_h ≈ aMax** (3 /h pickerel); any real refusal to attack → an explicit, diel prey-vigilance factor (PFF (c): 0.1–0.2 day, 0.5–1 twilight) | E_h 30 with aMax 3 means a starving pickerel ignores ~90 % of the prey it meets at low density, all day. That is an unmeasured attack probability per encounter of aMax/E_h = 0.10 (bass 0.08) |
| **`F3.ENC_DZ`** (`:114`, `stageR5` `:460`) | 0 → 0.3 m | none; field predators ambush at the edge and take prey crossing the drop-off (WPH B: 40–60 % of white perch kills at the weed edge at dusk) | d769dd5 (arm D2 / CPU: 65 % of killifish taken over 0.3–0.6 m by pickerel over 0.6–2 m) | **COMP → STACK** | no | **0** | It patched the disc smearing a shore slope's depths, a 10×-amplified artifact in the 1/10 lakes: 6 m spans ~0.7 m of bed there vs ~0.07 m at true scale (BAND_SLOPE `:75`). The shallow refuge it protected is now done by SHALLOW_K + the killifish strip ≤ 0.25 m (c313818) + BAND_REL. It is symmetric, so it also hides prey just DEEPER than the predator: perch on the edge, white perch crossing it. True scale: keeps 0.74–0.78 of catchable encounters. Screen D (1/10): ENC_DZ 0 raised pickerel p 0.30 → 0.48 at day 14 and brought perch into the top prey by day 84 (white perch too when COVER_CS is also off, P1) |
| RD = `strikeR × lunge × max(0.3, visDay)` (`:1926`; `S3` strikeR pike 1.2, bass 1.0) | as stated | pickerel 1.0–1.2 m, smallmouth 0.8–1.0 m in coloured water; colour does not lower realised pike feeding (Nilsson-Örtman 2026, PEA §1) | 28c05ab / db0d08e | REAL | yes | — (`clar` is algal turbidity only, `chem3.js:481`: not a colour double count) | — |
| `PRED3.pike.aMax` (`:634`) | 3 /h | esocids 1.4–5.8 strikes/h, hungry, prey in view (Wahl & Stein 1988) | db0d08e | REAL | yes | — | — |
| **`PRED3.bass.aMax`** (`:634`) | 12 → **2.5 /h** (in PRED3 itself, not only stageR5) | lab ceiling: largemouth ~31 /h open, **6–7 /h in half cover** (Savino & Stein 1982, 1989). "~0.3 strikes per hunting hour" (PFF §2) is a REALISED rate, derived from kills a day ÷ hours active | 4875ba0, with the first hunger gate (G0 0.5 %BW), when "encounters far exceed E_h wherever bass live" and the 8 %BW gut was the only brake | **COMP → STACK** | no | **6–7 /h** (half-cover ceiling) or the original 12, with E_h ≈ aMax and pGate as the brake | A missing satiation brake (now pGate) and the then-saturated encounter (now E ≈ E_h). A realised field rate imposed as a ceiling counts encounter limits twice. Screen P2 (aMax 12/h, with COVER_CS and ENC_DZ off): bass p 0.31 at day 14 against 0.18 without the aMax change (P1) |
| `PRED3.other.aMax` (`:634`) | 4 /h | none for perch-like piscivores ("a prior", `:629–633`) | db0d08e | PRIOR | yes | look up (perch: one FHM per 35 h per perch in tanks, RTF §3.1) | — |
| `vHunt` pike 0, bass 0.1 m/s (`:634`) | — | pike ambush (motionless > 70 % of contact time, Savino & Stein 1989); smallmouth 0.06–0.13 m/s (SHH) | db0d08e; bass 0.2 → 0.1 in 4875ba0 | REAL | yes | — | — |
| **`PRED3.pike.act`** (`:634`) | [0.15, 0.2, 0.02] day / twilight / night | pike **active (moving)** in 16–22 % of daylight intervals, 2 % at night (Diana 1979). **"Movement is not hunting"** (PFF §2): an ambusher with v = 0 hunts while still, and E already models prey passing it | 8f7047c — the brake for arm D (pickerel 3.9 → 13.9, bass 10 → 25 kg/ha by day 112), which came **before** the hunger gate (4875ba0), spring recruitment (c75429a — arm D's recruits were eaten under the agents' rule) and the killifish refuges (d769dd5, b03b61a, c313818) | **COMP → STACK** | no (as a satiation stand-in) | diel rhythm only, e.g. **[0.7, 1.0, 0.1]**, × a **pickerel hunger gate** (pGate ~0.4–0.5; a meal every 2.7 days, Diana) | Satiation, plus the arm D artifacts since fixed. Pickerel are ungated (`stageR5` `:484–488`), so act is their only brake besides an 18 %BW gut — and they now underfeed (p 0.18–0.30 vs 0.39–0.42, PFF (e)). Screen C (act ×2): pickerel p 0.30 → 0.43 at day 14 |
| **`PRED3.bass.act`** (`:634`) | [0.2, 0.5, 0.05] (was [0.3, 0.3, 0.1]) | moving 42 % of daylight, dawn and dusk peaks, little at night. PFF (b)'s toy hunted ALL daylight (twilight ×2) and the gate alone gave 40–70 % hunting time and p 0.28–0.35 | 4875ba0 | **STACK** | no (the gate does it) | **[0.6–1.0, 1.0, 0.1]** × pGate | Satiation again: act × pGate counts it twice. The sim's realised k while hunting (aMax × saturation × capture ≈ 2.5 × 0.45 × 0.16 ≈ 0.2 /h at true scale) is already inside PFF's 0.15–0.25 window. act 0.2 then cuts hunting to a fifth of the day before the gate acts |
| `S3.perch.act` (`stageR5` `:513`) / `PRED3.other.act` | [0.3, 0.3, 0] / [0.3, 0.3, 0.05] | yellow perch visual, by day; white perch feed in low light and at night (WPH) | 03e31d4 | PRIOR | yes | white perch: their own row with twilight and night feeding (review PE12) | — |
| **`CS3` + `SPINY3`/`PPR0` size term** (`:638–640`, `:1942`) | CS0 × (1 − PPR/PPR0), PPR0 0.88 soft / 0.6 spiny | CS0 values were **measured at PPR ≈ 0.25–0.43** (Wahl & Stein: "optimal size, 25–43 % of length": bluegill 0.14, FHM 0.67, shad 0.78; pike ambush 0.36 on roach at 0.30; largemouth 0.57–0.83 on bluegill at 0.12) | db0d08e, from PEA (b), which "renormalised so the term is 1 at PPR → 0" | **STACK** (size counted twice) | the size slope, yes | **f = (1 − PPR/PPR0)/(1 − PPRm/PPR0)**, PPRm ≈ 0.3 (esocids on spiny prey), 0.4 (soft-rayed), 0.12 (bass on sunfish); cap CS ≤ 0.9 | — (a bookkeeping error). At the typical PPR 0.32 (true scale) the term cuts capture × 0.60: a 10-cm perch to a 40-cm pickerel 0.20 instead of ~0.35 |
| `CS3.catfish` (`:639`; `stageR5` `:511` bass 0.2 → 0.05) + `S3.catfish.spineW` 1 → 1.6 | — | bullhead "least vulnerable" (Mauck & Coble); PEA (b): esocid 0.10, bass 0.20; Cooper 1941: bullhead 4.5 % of pickerel food, ~0 for bass | 03e31d4 (bullheads were 18 % of bass kills in arm M) | **COMP** | partly | cs bass 0.2; spineW from a measured fin-spine width or 1 | The bullhead's **daytime refuge**: resting under cover, in burrows or the mud, nocturnal (PLAN item 12's "day-rest cover" not built). It sits exposed on the bed in the bass's band (`S3.catfish.hab.day` bed 0.5–3.0, h 0.02, `:326`). At 1/10 bullheads are still 21–38 % of the pickerel's strike weight (prd2) |
| **`F3.COVER_CS`** (`:140`, `stageR5` `:584`; `wgsl.js:1032`) | 0 → 1 | **"Vegetation cuts encounters and attack initiation, not success per attack"** (PEA (b), RTF §3.1: Savino & Stein 1982, per-attack success 0.58–0.83 at 0–1,000 stems/m²). plants3's cover is already the full predation cut, 1/(1 + (S/150)³) (`plants3.js:128–133`) | 85bd755 (arm S → T; probe bassk.mjs: rock cover alone left kills unchanged, 50 → 23 of 75 small bass eaten with it) | **STACK** (cover squared when E < E_h) | no | **0**, and move cover out of the saturating E: E from uncovered prey, (1 − cover) once on each prey's attack weight | Cover inside E/(E + E_h) is lost when E ≫ E_h (the arm S symptom: "a hungry predator striking at its maximum only re-chooses its prey") and doubled when E ≪ E_h (today). Savino & Stein's attacks/h fell 31 → 3 at 250 stems under saturating prey, so cover belongs on attack initiation, outside the saturation |
| `S3.pike.schoolExp` 0.65 (`:351`, `:1940`) | a school of n met as n^0.65 | PEA diagnosis 4: "the dilution belongs in per-capita risk (one fish per strike), not in the predator's kill rate"; esocids unconfused (Turesson & Brönmark 2004) | 72d9c5f (old rule); re-added to STRIKE2 in ce8a6e1 (pickerel took a 36-fish killifish school as 36 fish, before the killifish refuges) | PRIOR / COMP | weakly (schools are 10–12 % of pickerel encounters at true scale) | geometric school detection (RD + school radius), or 1 | Schools as point agents. A real school is one large visual target, met less often but struck repeatedly |
| `F3.BASS_SCH` (`:140`, `stageR5` `:507`) | −0.8 → −0.6 per school fish | largemouth trials ending in capture 100/17/11 % at 1/8/15 prey (RTF §6.2); bass attack stragglers (6 % of attacked bluegill were schooled, Savino & Stein 1982) | 03e31d4 | PRIOR (extrapolated) | yes, within the data | cap n at ~15 (×0.2) or model stragglers | 80-fish super-individual schools extrapolate the lab curve to 80^−0.6 = 0.07 |
| perch-like × 0.15 into a school (`:1942`) | — | perch 0.20 → 0.03 into schools (Turesson & Brönmark 2004) | db0d08e | REAL | yes | — | — |
| `F3.PREY_PREF` / `PREY_OPT` (`:140`, `stageR5` `:508`) | 0 → σ 0.6 about 0.3 | lab optimum 0.25–0.43 (Wahl & Stein; Gillen 1981); field median prey 0.10–0.20 of TL (Gaeta 2018) | 03e31d4 | REAL (choice only) | yes | PREY_OPT ~0.2 for pike (field median), keep for bass | — |
| `F3.SHALLOW_K` (`:169`) | 0.02 m per cm: nil below 0.01·L m, full from 0.02·L m | Power 1987; Schlosser 1987; pickerel ~5–15 % of the day over beds < 0.5 m (Milipsigate, predators.md P1) | 9e02dd0 (stage P3) | REAL (mechanism) / PRIOR (value) | yes | keep; check a 40-cm pickerel's share over < 0.6 m against Milipsigate | — |
| **Hunger gate** `F3.HUNGER_GATE`, `S3.bass.pGate` 0.5 (`:1818–1823`; `stageR5` `:488`) | off → bass G = 0.5·Cmax·W/k; pickerel none | wild bass hold ~0.4 %BW and use ⅓–½ of the gut (Nelson 2017; Armstrong & Schindler 2011); pike a meal every 2.7 days (Diana) | 4875ba0 (G0 0.5 %BW) → f823620 (1 %BW) → 03e31d4 (pGate) | REAL (mechanism), calibrated value | **yes — it is the brake that act and the aMax cut stood in for** | keep for bass; **add it for pickerel** | — |
| `F3.SCOLD` / `F3.YCOLD` (`:124`, `:129`, `:1840–1841`) | 0 → 1: strikes at min(coldPerf, FB4 consumptionT) | bass near-still below 8–10 °C (Oliver 1977); pike attack falls below ~11 °C on agile prey (Öhlund 2015) | 72a3a21, 03e31d4 | REAL | yes | — | — |
| `FEED.MISS_CD` (`config.js:98`; set after a KILL, `fish3.js:1962`) | 0.1 / TS = 1,752 s (29 min) | 2-D compat ("after a missed strike"); post-meal rest is hours to > 24 h (Beaumont 2005), handling minutes | 28c05ab | LEGACY / PRIOR | harmless now (0 % of fish-steps, prd2) | handling time by prey mass; leave rest to the gate | — |
| One kill per predator per block; the young first in `_feed` (`:1845–1846`; GPU `k_strikeWin`) | — | — | f09291a | structural | yes | watch: with restored rates P(kill per 1,752-s block) can reach 0.3–0.5 | — |
| `F3.ATTACK`, `SCHOOL_EXP`, `SIZE_K` (`:85`, `:94`); `FRY.ATTACK`, `N_HALF`, `F3.YOY_EAT_R` | old rule | — | slice a, stage P, slice b | LEGACY (unused under `stageR5`: STRIKE2 1, FRY.DENSITY 1) | no | — | — |

### 2b. Size: gape, prey length, piscivory onset

| Parameter | Now | Field value + source | History | Class | Still needed? | Restore to | Missing mechanism |
|---|---|---|---|---|---|---|---|
| `gapeR` pike 0.13 (`species.js:390`), bass 0.115 (`:372`); prey `depthR` (white perch 0.30 `:349`, perch 0.234 `:297`, pumpkinseed 0.38 `:286`, bullhead 0.20 `:329`) | gape ≥ prey depth × spineW (`fish3.js:1565`) | pickerel swallow any fish no deeper than themselves, D ≈ 0.13–0.15 TL at 30–50 cm (Lawrence 1960); smallmouth horizontal gape 0.120·TL − 1.8 mm, fits pumpkinseed ≤ 31 % (Fernando 2018) | slice a | REAL | yes | pickerel ≥ 45 cm: D rises to 0.15 (Lawrence) | — |
| `PREY_LR` pike 0.55, bass 0.45, others 0.45 (`fish3.js:444`); `FEED.PREY_MIN` 0.07 (`config.js:102`) | — | pike window 0.03–0.55 (Persson 2006); max 0.32–0.46 (Gaeta 2018) | 88d75fc (pickerel cannibalism 1.5 %/wk at true scale) | REAL | yes | — | — |
| `Lpisc` / `yLpisc`: pike 8 / 5, bass 5 / 10 (`stageR5` `:625`), fallfish 10 → 30 (`:621`), perch 14, white perch 15 | — | young smallmouth eat fish from 10–15 cm (Dunlop 2005); fallfish fish only in pulses of naive fry | 42cbec3, 2d9db30, c1685d9 | REAL (bass yLpisc), PRIOR (fallfish 30: "only the largest") | yes | — | — |
| `S3.catfish.spineW` 1.6 | see 2a | — | 03e31d4 | COMP | see 2a | — | the bullhead's day refuge |

**What the size filter means.** At true scale 51 % of the fish within 6 m of a pickerel, and 75 % of those around a bass, are too
deep-bodied to swallow. That is real: the lakes' perches and bullheads are mostly adults. The field's piscivores eat young-of-year and
yearlings of 4–12 cm (PEA §4; Cooper's October Pushaw white perch averaged 4.9 g). In the sim those live in the young's density table, fed
by a different rule (2e). So most of the predators' food passes through the rule that was not audited as the "strike rule".

### 2c. Prey refuges and cover

| Parameter | Now | Field value + source | History | Class | Still needed? | Restore to | Missing mechanism |
|---|---|---|---|---|---|---|---|
| Weed cover on encounter `a.cover` (`fish3.js:1419`, `_inWeeds` `:2083`; plants3 S50 150 stems/m²) | (1 − cover) on E | Savino & Stein; Crowder & Cooper 1982; Smith 1995 (natural weed cut bass predation 10×) | 16b5257 (by stand, only within the canopy's height) | REAL | yes | apply once, on attack initiation (see COVER_CS) | **Edges**: two cleared strips gave 4.4× one strip's predation (Smith 1995); bass take bluegill along bed peripheries (Trebitz 1997) |
| `F3.SHALLOW_REFUGE` 0.6, full at bed ≤ 0.2 m (`:161`; the young `:2370`; seek and `_yoyTarget` `:1632`, `:2433`) | young's cover vs every predator | shallow water protects from large gape-limited piscivores, not from small ones (Schlosser 1987) or birds (Power 1987) | 28c05ab | PRIOR | yes, for big predators | predator-size-specific (SHALLOW_K-like) for the young too | Avian and small-fish predation in the shallows (PLAN item 16) |
| `S3.catfish.bury` 0.9, `F3.BURY_H` 0.3 (`:325`, `:172`, `:1420`) | cold-water burial | bullheads bury in soft ooze with only mouth and gills out (SFH) | 72d9c5f | REAL | yes | — | — |
| `S3.bass.bury` 0.8 for ≤ 25 cm below ~9 °C (`stageR5` `:527`) | — | young smallmouth shelter in substrate gaps below ~10 °C (Shuter 1989; MDIFW) | 03e31d4 | PROXY (mud burial for rock crevices) | yes, until a substrate map | a substrate-based cold refuge | **Substrate map** (rock, cobble, wood) |
| `S3.rockC` / `rockL`: bass 0.6 ≤ 15 cm, redbreast 0.5 ≤ 20, fallfish 0.4 ≤ 12, wherever bed < `LIT3.CR_ROCK_Z` 1.5 m (`stageR5` `:589`, `:1421`, `littoral3.js:85`) | — | young smallmouth in rocky shallows (MDIFW: "rocky with sand and mud areas"); gap size vs predator body (Lynch & Johnson 1989, WBS) | 85bd755 | PROXY + STACK | yes, as a real substrate | rock where rock is, gap-size-limited by predator size | **Substrate map**. Small bass now carry five stacked refuges: habJ 0.3–1.2 m, seek (L 12), rockC 0.6, bury 0.8 in the cold, and COVER_CS squaring it |
| `S3.seek` sunfish/redbreast {0.6, 8 cm, 0.4}, bass {0.6, 12, 0} (`stageR5` `:544`, `:575`; `_drive` `:1631–1634`) | cover-seeking drive by size | small sunfish shelter in weeds until they outgrow the gape (Werner et al. 1983; Mittelbach) | cd106f3, c313818 | REAL (mechanism) / PRIOR (weights) | yes | — | Predation risk as a sensed, learned habitat cost (the brain's fear input exists; the drive is innate) |
| `F3.RIFFLE_REFUGE` 0.9, `RIFFLE_D` 0.6, `RIFFLE_L` 10 (`:182`) | brook only | Power 1987; Schlosser 1987 | 283216b | REAL / PRIOR | yes | — | — |
| `ACTION.HIDE_CONCEAL` 0.5 (`config.js:1346`) | the brain's hide output | — | 2-D | PRIOR | yes | — | — |

### 2d. Habitat bands that decide who meets whom

| Parameter | Now | Field value + source | History | Class | Still needed? | Restore to | Missing mechanism |
|---|---|---|---|---|---|---|---|
| **Pickerel day band** `S3.pike.hab.day` bed [0.5, 2.5], 0.9 m over the bed (`:352`); `habJ` 12–35 cm [0.3, 1.5] (`stageR5` `:524`) | GPU arm V by day: 57 % of pickerel blocks over beds < 1 m, 12 % over ≥ 2 m | H3D table: "0.5–2.5 (**large 2.5–3.5***)"; half of detections at fish depth 0.76–1.82 m (Milipsigate); WPH B: outer weed edge 1.5–3.5 m at dusk, fish > 45 cm on the 2.5–4-m weedline by day; pike at 11/14 of Missisquoi's 3–4.9-m stations; Cooper's 3–15-m nets caught 78 pickerel | 28c05ab; habJ 03e31d4 | PRIOR, half-implemented | yes | adults ≥ 35 cm bed [1.0, 3.5], ≥ 45 cm to 4 m; habJ kept | **The weed edge as a habitat cue**, and **predators that follow their prey** (Brodersen 2015: pickerel move into open water where schooling prey are abundant) |
| Bass bands (`stageR5` `:470`, `:477–478`): day bed [1.0, 3.0] within 60–120 m of shore, night [0.5, 2.0], twilight 150–250 m | — | ≥ 80 % within 100 m (SHH); Maine 1.5–4.6 m over rock and drop-offs; fish > 40 cm deeper and farther out mid-July to mid-September (SHH §1; Green Lake ME) | 6f2784d, 03e31d4 | REAL (adults < 40 cm) | yes | add the large-bass late-summer row (bed 1.5–4.5, shore 120/250 m) | Substrate and structure (rock, drop-offs, wood) |
| Yellow perch adult day [3.0, 5.5] (`:318`), habJ 15–22 cm [1.5, 4.0] | GPU: 71 % of perch blocks over ≥ 2 m by day | perch to ~15 cm at the weed edge and open bottom beyond, large perch pelagic (Mrnak; Feucht 2023); "lakes 4–5.5 m deep with weeds to ~3.5 m have little offshore refuge" (PDPM §6) | 28c05ab; habJ stage P1 | REAL | yes | — | Dusk school break-up and the inshore pass (Helfman 1979) as encounter events, not only a band shift |
| White perch day [3.5, 5.5] → [2.5, 5.5]; habJ 7–15 cm [0.5, 2.5]; shore night [20, 60], twilight [60, 200] (`stageR5` `:503–505`) | GPU: 79 % over ≥ 2 m by day; the eaten white perch 52 % over beds < 1 m | WPH A (applied); autumn and early-ice weed-edge bands and the dusk surface layer not yet built | 03e31d4 | REAL (partly built) | yes | add the autumn 1.5–3.5-m day band (WPH: September–November is the peak of white perch predation) | Same as above |
| Killifish strip: day [0.05, 0.35] → [0.05, 0.25], night [0.05, 0.4] (`stageR5` `:460`, `:464`, `:592`) | — | "often in water under 6 in" (CT DEEP); netted in 15 cm 2.5 m from shore (Ward 2002); disperse into < 0.6 m at night with bass and pike (Helfman 1981) | d769dd5, b03b61a, c313818 | REAL | yes | — | The strip's own food (the killifish's ration falls to 0.43–0.47 there, PLAN.md progress) |
| `F3.BAND_LAKE` 0.6 (`stageR5` `:506`) | Lower's bands within its 3.9 m | — | 03e31d4 | REAL | yes | — | — |
| Bullhead day: on the bed, h 0.02, bed [0.5, 3.0] (`:326`) | — | in soft weedy coves by day (Eriksson 1978), inactive | 28c05ab | REAL band, missing refuge | yes | + day refuge | see CS3.catfish |

### 2e. Predation on the young (the bulk of a summer predator's food)

| Parameter | Now | Field value + source | History | Class | Still needed? | Restore to | Missing mechanism |
|---|---|---|---|---|---|---|---|
| `FRY.CLEAR_A` 0.4, `CLEAR_B` 0.6 (`config.js:251`; `_yReq` `fish3.js:2227`) | 400·L(mm)^0.6 L/day: 14.6 m³/d for a 40-cm pickerel | perch cannibals 3.1–8.1 m³/d at 30–150 mm (Persson 2004); pikeperch 190–380 mm 9.6 ± 2 m³/d (Persson & Brönmark 2002) — **daily-averaged field clearance**; no esocid or bass value (YPF §1) | 03a0497 (stage Y1) | REAL for percids; PRIOR for pickerel and bass | yes | — | **Two bases for one predator**: the agents' rule uses an in-bout encounter volume (π·RD²·u ≈ 1,600 m³/h for a pickerel) × act × saturation; the young's uses a realised daily clearance (~15 m³/d) on the 50-m column's density. Per fish at equal density, before act and saturation, being a followed agent makes a prey ~10³× more encounterable than being a schooled young fish |
| `FRY.WIN_R` 5.3, `WIN_E` 6.5, `WIN_MIN` 0.04 (`config.js:252`; `fish3.js:2232`) | perch-cannibal window, peak r ≈ 0.19, steep below ~0.1 | perch and pikeperch 0.05–0.45, optimum 0.16–0.20 (YPF §1); **pike 0.03–0.55** (Persson 2006), median prey 0.10–0.20 of TL (Gaeta); esocid young peak 0.3–0.4 (predators.md P13) | 03a0497 | PRIOR (extrapolated to esocids and bass) | yes, per species | per-species windows: pike broad 0.03–0.55; esocid young peak 0.3–0.4 | — |
| `FRY.LARV_A` 0.1 (`config.js:253`) | × a plankton eater's clearance on larvae | "[inf; calibrated on the year's fates — at 0.3 … recruits fell 83–92 %]" | 03a0497 | **COMP** (calibrated to recruitment) | yes | from larval encounter data (DETECT_L exists) | The larvae's own refuge: the littoral weeds and surface of the edge (Faber 1980, H3D), larval escape |
| `FRY.M_LARVA3` 0.04, `M_JUV3` 0.015 /day (`config.js:262`) | the young's unsimulated mortality | "stands for … cyclopoids, Chaoborus, insects, birds, disease" (`config.js:254–261`) | 03a0497 | COMP (for missing predators) | until they exist | — | **Birds, odonate nymphs, Chaoborus** as explicit predators (PLAN items 16, 38) |
| `F3.RECRUIT_SPRING` / `RECRUIT_WARM` (`:121`, `:132`) | recruit at age 1 when the water warms | fisheries count at age 1 — fine as a definition | c75429a (arm E: 386,000 young bass recruited in July–August and were eaten within days — ~15 %/day under the agents' rule vs ~1 %/day under the young's) | STACK (hides the two-rule inconsistency) | the definition, yes | keep; **unify the rules** — schools into the encounter rule (HOT_BROOK_3D.md item 5 "NEXT") | One predation rule for all fish |
| `BROOD.PROTECT` 0.8 (`config.js:307`) | guarded broods | nest guarding (Ridgway) | 2-D | REAL / PRIOR | yes | — | — |

### 2f. The other food and the regulator that took predation's place

| Parameter | Now | Field value + source | History | Class | Still needed? | Restore to | Missing mechanism |
|---|---|---|---|---|---|---|---|
| Crayfish (`stageR5` `:627`): CR_PREF 5 → 1, CR_OUT [0.3, 0.7] → [0.15, 0.6], capacities ÷ 5 | continuous food response, not the strike rule | crayfish avoided or neutral when fish are available (Carter 2010; McNeely 1990); sheltered by day (Hill & Lodge 1994); scarce in soft Maine water (the human; Ca ≲ 2 mg/L [SEC]) | 0ddd1ef | REAL values, structural mismatch | yes | through the same encounter–strike route (PEA (e)) | Today bass live on crayfish (p 0.09–0.12) because fish strikes are suppressed: the crayfish route has none of the strike rule's brakes |
| `F3.CAP` 1.5 × census (`:232`) | discards recruits | — | slice b | COMP | as a safety only | "never binding" (PLAN item 30) | It regulates white perch (at the cap in arms R–U) in place of their predators |

---

## 3. The spatial-overlap question: why are strike calls empty?

**The 1/10 probes overstate spatial emptiness.** The 1/10 lakes keep true depths but shrink distances 10×, so bed slopes are 10× steeper.
A 6-m disc spans ~0.7 m of bed on a typical slope there, against ~0.07 m on the true lakes (`F3.BAND_SLOPE`, `fish3.js:75`). ENC_DZ (0.3 m)
therefore zeroes most cross-band prey at 1/10 and few at true scale. Screen D (ENC_DZ 0) shows the effect: pickerel p 0.30 → 0.48 and
perch entering the top prey (white perch too with COVER_CS also off). prd2's "no candidate 60–82 %" lumps three causes.

**At true scale the disc is rarely empty.** This audit's snapshot (prdT, mid-July, seed 509) found:
- only 1 % of pickerel and bass calls had no fish within 6 m, with 31–43 fish around a pickerel and 48–86 around a bass;
- **44–57 % had fish but none catchable**, almost all by the gape: 51 % of the fish around a pickerel and 75 % around a bass are deeper than its mouth;
- 1 % lost every catchable fish to refuges.

GPU arm V's year agrees. Perch and white perch were the most-met prey of both predators: pickerel met 1.54 G and 1.85 G fish-blocks of
them, bass 4.0 G and 7.3 G. But only 49 % and 36 % were takeable by pickerel, and 27 % and 16 % by bass.

**Depth segregation by day still holds, and the pickerel sit too shallow.** GPU arm V, by day:
- pickerel 57 % of blocks over beds < 1 m and 12 % over ≥ 2 m. The field has pickerel at half their fish depths 0.76–1.82 m and 5–15 % of the day over < 0.5 m;
- perch 71 % and white perch 79 % over ≥ 2 m;
- the white perch the predators did eat were 52 % over beds < 1 m (the shallow minority; 37 % under 10 cm), 66 % of them by day.

So the predators meet the shallow fraction of the perches. Kills by light were pickerel 73 / 22 / 5 % day / twilight / night, against WPH's
40–60 % of white perch kills in the ±1-h dusk and dawn windows.

**Is that realistic for Hot Brook?** Hypsography from `GEO` (true lakes):

| Bed depth | Upper | Lower |
|---|---|---|
| < 1 m | 11 % (median 5–22 m from shore) | 16 % |
| 1–2.5 m | 23 % (52–90 m) | 18 % |
| 2.5–3 m | 9 % (114 m) | 20 % |
| ≥ 3 m | 57 % (175–276 m) | 45 % |

With plants to ~3.4 m (the Nitella meadow; canopy band 1.3–3.2 m), ~58 % of Upper's bed and ~80 % of Lower's lie inside the vegetated zone
and its edge (< 3.5 m). Only Upper's ≥ 3.5-m basin (~42 %) and Lower's ≥ 3.5 m (~19 %) are true open bottom.

In lakes like this the field puts predators beyond the 2.5-m line:
- Missisquoi Bay (3–4.9 m, unstratified): pike at 11 of 14 open-bay stations, smallmouth at 10 of 14;
- Cooper's 3–15-m overnight nets caught 78 pickerel and 66 bass;
- Brodersen et al. 2015: pickerel move into open water where open-water schooling prey abound;
- H3D's own table gives large pickerel 2.5–3.5 m;
- WPH B: pickerel at the outer weed edge (1.5–3.5 m) facing open bottom at dusk; fish > 45 cm on the 2.5–4-m weedline by day; large bass over 3–5.5 m in late summer.

The sim instead fixes the predators by bed depth, independent of where their prey are. The pickerel band (0.5–2.5 m, and 0.3–1.5 m to
35 cm) holds them at the inner half of the vegetated zone.

**What the empty calls really stand for.**
1. The prey met are mostly adults beyond the gape. That is real, but it means the agents' rule mostly sees uncatchable fish. The real bulk,
   young-of-year and yearlings of 4–12 cm, comes through the young's density rule on a different, much smaller clearance basis (2e).
2. The predators sit in too-shallow, fixed bands. They do not follow prey, do not hold the weed edge, and large fish do not use the deeper
   weedline or the basin edge.
3. Patchy point-agent schools in a 6-m snapshot. 23 % of the pickerel's calls with catchable prey had E < 3 /h, and with E_h = 30 /h the
   saturating rule turns that patchiness into lost strikes (Jensen's inequality on a concave function).

---

## 4. Missing predator-relevant features of the environment (with the evidence)

1. **The weed edge as a place.**
   - Predation rises with edge length: two cleared strips gave 4.4× one strip's (Smith 1995, RTF).
   - Bass take bluegill along bed peripheries (Trebitz 1997, WBS).
   - With pike present, roach held ~1 m from the macrophyte edge (Jacobsen & Perrow 1998).
   - Pike are most efficient around refuges (Eklöv & Diehl 1994).
   - Bass grew better at hydrilla edges (Morrow 1991).
   - The sim has stands and a canopy height per cell, but no edge cue or edge-facing ambush posture. Predators and prey find the edge only through depth bands.
2. **Predator habitat that follows prey, and ambush-site relocation.**
   - Pickerel go to open water where schooling prey are (Brodersen 2015).
   - Pike move ~0.7 m/min by day and hold home areas < 4.5 ha in weed beds 1.5–3 m deep (Margenau 1986, PEA Add. 2).
   - Pike are active 37 % of the time with dawn and dusk peaks along vegetated shore (Cook & Bergersen 1988).
   - The sim's predators pursue only prey they sense within ~4 m (`_drive` `:1648`). They have no memory of good ambush sites, no giving-up time and no area-restricted search.
3. **Size-dependent predator habitat.** Large pickerel at 2.5–3.5 m (H3D) or 2.5–4 m (WPH); bass > 40 cm deeper and farther out in late summer (SHH §1). Only juvenile bands (`habJ`) exist.
4. **The prey's diel movement in the encounter itself.**
   - Yellow perch end feeding, break up their schools and settle on the bottom at dusk (Helfman 1979).
   - Attacks on schools peak in civil twilight (Major 1977).
   - Minnows detect a stalking pike at ~⅓ of the daylight distance at dawn (Pitcher & Turner 1986).
   - In the sim, ENC_U is a constant 0.1 m/s and prey vigilance has no diel form. E_h 30 /h acts as an unmeasured, constant refusal to attack.
5. **Prey vigilance and avoidance.** By day prey see a bass at ~2 m and keep away; minnows quit bass pools within 3 h; alarm substance tightens schools (Sosna 2019) (PFF (c); RTF). This is the honest home for a per-encounter attack probability (day 0.1–0.2, twilight 0.5–1).
6. **A substrate map** of rock, cobble, wood, sand and mud.
   - Smallmouth structure: rock, drop-offs, wood (SHH §3).
   - The young bass's cold refuge (Shuter 1989).
   - Redbreast at stony and wooded margins.
   - Crayfish shelter and size refuge (Stein 1977; Hill & Lodge 1994; DiDonato & Lodge 1993).
   - Gap size against predator body width: bluegill chose 40-mm gaps, bass > 300 mm used only 350-mm gaps (Lynch & Johnson 1989, WBS).
   - Today `CR_ROCK_Z` 1.5 m stands in for all of it.
7. **The bullhead's daytime refuge and nocturnality.** It rests under cover, in burrows or mud by day and forages out after dark (Eriksson 1978). Today `cs` 0.05 and `spineW` 1.6 compensate.
8. **Birds and mammals** — kingfisher, heron, mergansers (the human's photo of a merganser brood), loon, osprey, bald eagles (the human sees them on Upper), otter.
   - The shallows' refuge is a trade-off between fish and wading or diving birds (Power 1987).
   - Today the shallows are safe from above, and `M_OTHER` / `M_JUV3` carry the loss (PLAN item 16).
9. **Sea-run alewife** in Lower (MDIFW 2024). A pelagic schooling prey: where alewife are, pickerel go to open water and eat almost only alewife (Brodersen 2015) (PLAN item 35).
10. **Frogs and tadpoles** (Cooper: 4.4 % of pickerel food), **large odonate nymphs and *Hexagenia*** (bass insects 25–40 % at ≥ 30 cm in crayfish-poor water, PFF §4) — PLAN item 38.
11. **Overhead and ambush cover**: lily pads, wood, docks (`lily_pad_fauna.md`). Pickerel and small bass hold under pads and use shade to ambush.
12. **The brook's mouth pools as ambush points.** The human: larger bass "in the deep part by Upper … waiting for all the schools of small minnows" (predators.md B31). Only the bigger-deeper rule exists.
13. **Angling** — catch-and-release bass, harvested pickerel and white perch (bag 25). It sets the predators' size structure (PLAN item 37), and the size structure sets the gape filter above.
14. **Relative escape performance in the cold.** Pike attack speed is 0.2 + 3.2/(1 + e^((5 − T)/1.2)) m/s; capture success is 1/(1 + e^(−2·v_diff)) (Nilsson-Örtman 2026, PEA Add. 2). SCOLD scales appetite, not the predator–prey speed difference.

---

## 5. What to undo first, and why it needs no new mechanism

These corrections follow the research the code cites. Judge each on the GPU at true scale (≥ 3 seeds), not at 1/10, by:
- p (pickerel 0.39–0.42, bass 0.30–0.36);
- kills a day (0.4–0.8 / ~1);
- 35–60 % empty stomachs;
- Maine length at age.

1. **COVER_CS → 0, with cover moved onto attack initiation** (E from uncovered prey; (1 − cover) once on each prey's attack weight). This keeps the arm T protection without squaring it.
2. **The size term renormalised** to the PPR at which each CS0 was measured.
3. **E_h ≈ aMax; bass aMax back to the lab ceiling** (6–7 /h half cover, or 12). The realised 0.17–0.3 per hunting hour must emerge, not be imposed.
4. **act becomes a diel rhythm** ([0.7, 1, 0.1] pickerel, [0.6–1, 1, 0.1] bass), with **pGate for pickerel too**. The gate is the brake the research asked for; act and the aMax cut were its stand-ins.
5. **ENC_DZ → 0** at true scale. SHALLOW_K and the killifish strip carry the shallows' refuge.
6. **Then** the habitat work in §3 and §4: size-dependent predator bands with the outer weed edge, predators that follow prey, one rule for young and agents with per-species windows, the bullhead's day refuge, and a substrate map. Each of these lets one remaining compensation go: catfish cs/spineW, rockC/bass bury, RECRUIT_SPRING's role, LARV_A, M_*3, the census cap.

**Expected risk.** Items 1–5 multiply the strike hazard by roughly 15–25× before the gate (capture ×1.6–2, saturation ×2, act ×4–5,
encounter ×1.3). That is deliberate: the hunger gate then sets p, as the research designed (PFF (b)). Without the pickerel gate, item 4
would repeat arm D's overfeeding.

The small fish's survival then rests on real refuges, not on suppressed predators. This is the test of those refuges that the stacked
brakes have been masking.

**Note on the GPU code.** `wgsl.js:1017–1019` still says the strike grid is "kept" at the block's start. `gpufish.js:320–322` regrids
under `F3.FRESH_HASH`. The comment is stale; the behaviour matches the CPU.
