# Fish eating fish larvae: encounter, capture, overlap and saturation, for a mechanistic larval-predation rate

Compiled 2026-10-22 for the Hot Brook lakes (two shallow, tea-coloured, mesotrophic lakes in eastern Maine, mean depth ~3 m). Fish: yellow perch, white perch, pumpkinseed, redbreast, smallmouth bass, chain pickerel, white sucker, brown bullhead, fallfish, banded killifish, blacknose dace, plus sea-run alewife from mid-May into June.

**Why this note exists.**
- Field larval Z in lakes with fish is 0.05–0.3/d, and 70–90 % of it is fish predation (`larval_mortality.md` §1–3).
- The sim's fish meet larvae through a clearance of 0.4·L(mm)^0.6 m³/d × `LARV_A` 0.1 × a detectability ramp (0.2 at 6 mm → 1 at 15 mm; `config.js` `FRY.DETECT_L`). At ~60 larvae/m² they take only 0.002–0.004/d of perch larvae.
- This note collects what is needed to replace that with a mechanism:
  - how far predators see larvae;
  - clearance and feeding rates on larvae;
  - capture success by size;
  - where and when larvae and predators overlap;
  - saturation;
  - predation per unit predator density.

**Tags.**
- **[primary]**: read in the paper body.
- **[abstract]**: read in an abstract.
- **[secondary]**: cited by another source, which is named.
- **[snippet]**: search-result summary only.
- **[inf]**: my arithmetic or inference, shown.
- **†**: read in this session by a sub-researcher and not re-read by me.
- **Re-read by me** in the downloaded texts: Treasurer 1997, Byström et al. 2015, Fuiman & Gamble 1988, Pepin et al. 1992, Paradis 1999, Sørnes & Aksnes 2004, and the definitions and light regime in Cowan & Houde 1993.

**Cross-references.** This note does not repeat them:
- **LM** = `larval_mortality.md` (field larval Z, cause partition, densities).
- **YPFR** = `../Whole lake 3D fish simulation/young_piscivore_functional_response.md`. It already holds:
  - Folkvord & Hunter 1986 and Margulies 1989 in-bout rates and the escape Weibull;
  - the Persson/Claessen cannibal attack rate 400·L^0.6 L/d, which is the sim's `CLEAR_A/CLEAR_B`;
  - the Miller et al. 1988 regressions, Scharf 2003 handling and capture, and the young-piscivore Holling rule.
- **PEA** = `piscivore_encounter_attack.md` (light at depth in Hot Brook, colour effects on esocids).
- **SRA** = `../Hot Brook populations and water/sea_run_alewife.md` (run timing, residence, Maine adult diets).
- **FFE** = `forage_fish_early_life.md`; **FZC** = `fish_zooplankton_coupling.md`.

**What is new here:**
- mesocosm and enclosure clearances of fish on larvae, normalised against the visual-planktivore clearance allometry (the ρ ratio below);
- the alternative-prey effect;
- a field clearance per adult perch from Loch Kinord, a 1.5-m-deep unstratified loch;
- alewife, smelt and white perch field rates, and Maine alewife diets;
- spatial and diel overlap;
- the functional-response shape;
- a predator-density check at the sim's densities.

---

## 1. Takeaway table

| Quantity | Value | Predator → prey, conditions | Source | Tag |
|---|---|---|---|---|
| **Visual planktivore maximum clearance on crustaceans** | **Cmax = 3.42×10⁻⁷·L^2.94 m³/s** (L in cm; r² 0.92, n = 48). That is 0.14 / 0.46 / 1.07 / 3.5 / 8.2 / 15.9 m³/h at 5 / 7.5 / 10 / 15 / 20 / 25 cm. Perch 96.7 mm on *D. magna*: 8.6×10⁻⁴ m³/s (3.1 m³/h) | Lab, light not limiting | Sørnes & Aksnes 2004, L&O 49:69 (Bergman 1988 for perch) | [primary]; m³/h [inf] |
| **Reaction distance (RD) to fish larvae** | **No measured value for any freshwater fish was found.** Anchovy and chub mackerel swam within 20–30 cm of 6-mm larvae without attacking. IBMs use an encounter radius of 0.8 × predator length for fish | — | Folkvord & Hunter 1986 (YPFR); Cowan et al. 1996 via Paradis 1999, Table 3.2 | [primary]; [secondary] |
| RD to zooplankton | Bluegill reaction angle = 1.7 + 18.9/SL(cm) mrad, so ≈ 31 cm for a 10-cm-TL bluegill on a 2-mm *Daphnia*. Age-0 yellow perch on *D. pulicaria*: **5.0 cm at 3,000 lx → 2.8 cm in the dark**; capture 94 %. Brook stickleback (5.1 cm) never struck beyond 2.5 cm | Lab | Li, Wetterer & Hairston 1985; Richmond et al. 2004; Wetterer & Bishop 1985 | [primary †]; [abstract †]; [primary †] |
| **Clearance on larvae, no alternative prey** | **6.0 m³/d** (50-mm stickleback, 5–6-mm capelin, 13 °C, 2.7 m³). **6.1 m³/d** (single 63-mm sprat or 90–155-mm sandeel, ~9–11-mm herring larvae, 11.8 °C, 15.5 m³). **1.1 m³/d** (45-mm bay anchovy, 3–10-mm goby larvae, 24 °C, 3 m³). That is **0.8–3.6 × Cmax** over the light hours | One predator per container | Pepin et al. 1992; Fuiman & Gamble 1988; Cowan & Houde 1993 | [primary]; clearance and ratio [inf] |
| **Clearance on larvae with natural zooplankton present** | Bay anchovy **0.12 m³/d (÷ 9)**. 62-mm stickleback on 7-mm perch larvae in a 39-m³ pond enclosure: **0.74 m³/d** over 18 d. That is **0.08–0.15 × Cmax** | Zooplankton ~500/L; natural pond plankton | Cowan & Houde 1993; Byström et al. 2015, Ambio 44:S451 | [primary]; [inf] |
| Clearance in a bout, adult bluegill | 9.8 larvae/h at 19 larvae/m³ → **≈0.5 m³/h** per bluegill (0.15–0.28 × Cmax for a 12–15-cm fish) | Larval bluegill 3–22 mm (mean 8.6), 5.3-m³ mesocosm | Kim & DeVries 2001, TAFS 130:189 | [abstract †]; [inf] |
| **Field clearance, adult perch** | **≈70–200 m³/d per adult perch** (0.2–0.75 × Cmax over 17 h) | 4.8–9.7 adults/ha (age 3–17, ~20–33 cm), larval Z 0.044–0.063 from cannibalism; Loch Kinord, mean depth 1.5 m | Treasurer 1997 (densities; diet); Treasurer 1989 (Z) | [primary] + [abstract]; [inf] |
| Alternative prey | 10× *Daphnia* cut predation on larvae by 10–20 %; 100× cut larval mortality by 75–90 %. Alewife piscivory peaked (40–70 % of stomachs) when zooplankton crashed | Yearling bluegill on white perch larvae; Claytor Lake alewives | Margulies 1990, EBF 27:187; Kohler & Ney 1980 | [abstract †] |
| **Size window** | Vulnerability is dome-shaped with its peak at **larva ≈ 10 % of predator length** (fitted vertex 0.11). Larvae are beyond reach at **26–33 %** (anchovy 33 %, stickleback 26–30 %, alewife 28 %). Gape does not set the limit (alewife gape ≈ 2 × the largest larva's depth) | 12 lab studies, 301 observations | Paradis 1999 / Paradis et al. 1996; Cowan & Houde 1993; Brooking et al. 1998 | [primary, OCR]; [primary]; [abstract †] |
| Capture by larval length | Alewife (122 mm): **every larva < 16 mm caught on the first strike**; 75 % eaten per hour at 25 mm, 33 % at 30 mm, 5 % at 34 mm. Yearling bluegill: ~100 % of < 6 mm SL in 15 min, 30 % at 12 mm, 18 % at 14 mm. Yearling herring: P(capture) 0.9 → 0.5 at 26 mm → 0.1 at ~30 mm | Lab | Brooking et al. 1998; Margulies 1990; Fuiman 1989 | [abstract †]; [abstract †]; [primary †] |
| Small larvae and detection | Small larvae are **mostly as or more vulnerable** than larger ones: 3–4-mm larvae 100 %; alewives chose 7.3–7.6-mm perch larvae over the bay's 8.0–8.6 mm; bluegill selection neutral < 8 mm. Only anchovy (Folkvord & Hunter) under-took 6-mm larvae | — | Cowan & Houde 1993; Brandt et al. 1987; Kim & DeVries 2001 | [primary]; [abstract †]; [abstract †] |
| **Larvae per predator per day, field** | Lake Ontario alewives: 3.8 and 32.6 larvae per stomach, max 361, 30–41 % of night littoral stomachs. **Maine (Lake George): 9 of 17 sea-run adults held 101 fish (May 1991); larval yellow perch were 35 % of items (May 1992).** Smelt: 8.4 larvae/smelt/d at peak. Lake Erie: 0.3–4.1 perch larvae per predator per day (90 % white perch) | Field stomachs | Brandt et al. 1987; Kircheis 2004 via SRA; Loftus & Hulsman 1986; Ludsin via a 2014 news article | [abstract †]; [secondary]; [abstract †]; [secondary †] |
| Digestion of larvae | < 30 min (anchovy on 3–4-mm larvae); herring larvae "almost completely within an hour"; perch on vendace larvae, recognisable 2 h and countable 3.5–4 h at 6–14 °C | — | Hunter & Kimbrell 1980; Balfoort (ICES 1984); Haakana 2008 | [primary †]; [snippet †]; [primary †] |
| **Overlap** | Perch larvae go pelagic from hatch until 11–30 mm (later where cannibals are dense). In West Blue Lake they were at the surface at night and ~5 m down by day. *Lepomis* larvae stay shallow-limnetic near the colonies. Alewives took perch larvae **mainly at night in the littoral**, in the 2 weeks after peak hatch. No larvae were found in pike stomachs | — | Byström et al. 2003; Wong 1972; Garvey et al. 2002 via FFE; Brandt et al. 1987; Treasurer 1997 | [abstract †]; [primary †]; [secondary]; [abstract †]; [primary] |
| **Shallowness** | Loch Kinord (1.5 m): perch larvae in **59–63 % (occurrence) of adult-perch diets** through the larval period. Deeper Swedish lakes: cannibalism by perch aged 2+ "did not include early larval stages" | — | Treasurer 1997; Byström et al. 2003 | [primary]; [abstract †] |
| **Functional response** | **Linear at field densities**: smelt stomach counts ∝ larval abundance; anchovy egg consumption independent of density; a stickleback eating 445 larvae/d (185 larvae/m³) was at only ~2 % of body mass/d. Perch ate vendace larvae only where larvae were dense; Z rose with density in bluegill ponds (r 0.64–0.90) | — | Loftus & Hulsman 1986; Cowan & Houde 1993; Pepin et al. 1992; Haakana 2008; Partridge & DeVries 1999 | [abstract †]; [primary]; [primary]; [primary †]; [primary †] |
| **Z per predator density** | 0.14 sticklebacks/m² (0.9 m deep) → predation Z **0.114/d** over 18 d. 4.8–9.7 adult perch/ha → larval Z 0.044–0.063. Smelt 476 vs 3,435/ha → 15–52 % vs 37–100 % of larval cisco mortality. Alewives → perch larval Z **1.58 vs 0.22–0.28/d** without them | — | Byström et al. 2015; Treasurer 1989/1997; Myers et al. 2009; Mason & Brandt 1996 | [primary]; [primary]/[abstract]; [abstract †]; [abstract] |

**The one-line answer [inf]:**
- **Encounter volume.** A fish searching where larvae are clears larvae at about the rate it clears zooplankton of similar visibility. That is ≈1–4 × the visual-planktivore Cmax with nothing else to eat, and **≈0.1–0.3 × Cmax when natural zooplankton is present**.
- **Size window.** Larvae are in the window from ~3 % to ~30 % of predator length, peaking at ~10 %. Gape does not limit them; escape does.
- **The lake rate is set by overlap and diet**, i.e. who forages in the larvae's water and when, not by detection.
- **At the sim's predator densities (~2,500 fish/ha, 3 m deep)**, this gives a fish-caused larval Z of **≈0.06–0.3/d, central ~0.12–0.16** (§3.4). That is the field value.
- **The sim's present rule is ~3–60× too small** per encounter (most for larger predators). Its detection ramp is steeper than most of the evidence.

---

## 2. Findings by question

### Q1. Reaction distances to larvae vs zooplankton; pigmentation and light

**No freshwater reaction distance to fish larvae was found.** The larval-predation literature measures the steps after encounter instead: mesocosm mortality, capture and size windows.
- **Bailey & Houde 1989** (Adv. Mar. Biol. 25:1, doi:10.1016/S0065-2881(08)60187-X) is closed; no open copy was found. Secondary statements from it:
  - vulnerability = encounter × susceptibility (attack × capture) [secondary: Paradis 1999; Litvak & Leggett 1992];
  - vulnerability is dome-shaped about a size, "e.g. 5 to 7 % of the predator's body length (Kerr 1974)" [secondary: Pepin et al. 1992, MEPS 81:1];
  - larval colour and movement raise the predator's RD [secondary: Litvak & Leggett 1992, MEPS 81:13];
  - Paradis' Table 3.2 credits Bailey & Houde with an encounter radius of 0.1 × length for crustacean predators [primary, Paradis 1999, OCR].
- **Encounter-model conventions.** Paradis' IBM (Memorial Univ. PhD 1999) uses a Gerritsen–Strickler encounter, E = πR²N(u² + 3v²)/(3v) for v ≥ u, with R = a·L [primary, OCR]:
  - fish predators a = 0.8 (Cowan et al. 1996, ICES JMS 53:23), ctenophores 0.5;
  - larvae assumed motionless at night; 13 h of daylight.
- **What predators do near small larvae.** Anchovy (85 mm) and chub mackerel (191 mm) swam within 2–3 dm of 6-mm larvae without attacking. Anchovy consumption peaked on 8.5–15-mm larvae (Folkvord & Hunter 1986, Fish. Bull. 84:859) [primary, in YPFR].
- **Effective radii from clearances [inf].** R_eff = √(Q/(π·v·t)):
  - bay anchovy (v 6.5–12 cm/s) ≈ 0.4–1.4 cm;
  - stickleback and sprat ≈ 2–3 cm.
  - The visual Cmax of a 10-cm fish at 10 cm/s also gives R_eff ≈ 3 cm.
  - So effective radii, which include the attack and capture decision, are far below measured RDs for both larvae and zooplankton. **Calibrate encounter on clearance, not on RD.**

**RD to zooplankton** (the comparison base):
- **Bluegill.** Reaction angle = 1.7 + 18.9/SL(cm) mrad (5.85 + 65.01/SL in minutes of arc), fitted to Hairston et al. 1982 and Breck & Gitter 1983. Angles are to mean prey diameter = 0.64 × *Daphnia* length; TL→SL 0.78 (Li, Wetterer & Hairston 1985, Ecology 66:1729) [primary †].
  - For a 10-cm-TL bluegill and a 2-mm *Daphnia*: ≈31 cm [inf †].
  - Breck & Gitter's own coefficients were not obtained; their abstract says RD rises non-linearly with size over 27–162 mm SL at a near-constant visual angle [abstract †].
- **Age-0 yellow perch on *D. pulicaria*.** Maximum RD 5.0 ± 0.8 cm at 3,000 lx, falling below 2 lx, minimum 2.8 ± 0.1 cm in the dark (lateral line). Capture 94 % at 0–3,400 lx (Richmond, Hrabik & Mensinger 2004, J. Fish Biol. 65:195) [abstract †].
- **Light.** RD is constant over 50–1,400 lx and reduced at 10–50 lx (lake trout and others; Confer et al. 1978, Oikos 31:27) [abstract †]. Perch RD and consumption fall below ~10 lx [secondary †: Wellington et al. 2010].
- **Brook stickleback** (5.1 cm) never struck at *Daphnia* more than 2.5 cm away (Wetterer & Bishop 1985) [primary †].
- **Alewife** feeds on *Daphnia* in the dark by filtering, not size-selectively (Janssen 1978, EBF 3:239) [snippet †].
- **Planktivores vs piscivores.** Planktivore RD is acuity-limited; piscivore RD is contrast-limited and depends much less on prey size (Breck 1993) [snippet †].

**Larval visibility: pigment, motion, transparency, colour:**
- **Pigmented eyes make larvae visible.** Anchovy eggs and yolk-sac larvae without pigmented eyes were "less readily detected" than early eyed larvae (Brownell 1985, TAFS 114:512) [abstract †].
- **Contrast and motion both raise RD.** Two-spotted goby RD rose with prey contrast (red > transparent *Calanus*) and with mobility, independent of turbidity (Utne-Palm 1999, J. Fish Biol. 54:1244) [abstract †].
- **Pigment can help or not.** Haemoglobin-rich *Daphnia* were seen farther than translucent ones of the same size, but ink-darkened guts did not raise RD (Confer et al. 1978) [abstract †].
- **Older larvae are seen and attacked more.**
  - Herring larvae become "larger, less transparent, and more pigmented". Encounter × attack by yearling herring rose 87 % from 9 to 17 mm, i.e. R × ~1.37 [inf †], while larval swimming speed changed encounter by only ~0.4 % (Fuiman 1989, MEPS 51:291) [primary †].
  - Only 6.2 % of herring larvae < 26 mm responded to attacks.
- **Attack geometry.** Herring attack larvae from below (mean 43–48°), where contrast is best (Thetmeyer & Kils 1995, MEPS 126:1) [primary †].
- **Brown and turbid water.**
  - YOY pike RD to *Daphnia* *rose*, but RD to larval roach was "severely reduced" in turbid or DOM-brown water. Higher attack rates partly offset the lower search efficiency (Jönsson et al. 2012, Ecol. Freshw. Fish 21:461) [abstract †].
  - Larval-perch DNA was found in more predator stomachs in the **clearer** of two Lake Erie river plumes (Carreon-Martinez et al. 2014, Mol. Ecol. 23:5366, doi:10.1111/mec.12927) [abstract †].
  - Hot Brook (30–60 mg Pt/L, Secchi 2.5–4 m) is far clearer than those turbid plumes. PEA §1 found pike feeding unchanged in brown water [inf].
- **Larval escape** (Williams 1994 PhD, Memorial, five marine species) [primary †]:
  - log₁₀(escape speed, cm/s) = 0.0591·TL(mm) + 0.5624;
  - distance in the first 100 ms (cm) = 0.1405·TL + 0.11;
  - i.e. ~8, 14 and 28 cm/s and 1.0, 1.5 and 2.2 cm at 6, 10 and 15 mm [inf †].

### Q2. Clearance, feeding rates, capture success, escape

**Mesocosms and enclosures (per predator; clearance = Z_pred × volume):**
- **Pepin, Shears & de Lafontaine 1992** (MEPS 81:1) [primary]:
  - one naïve threespine stickleback (30–70 mm SL) per 2.7-m³ mesocosm; 500 capelin yolk-sac larvae (3.9–6.7 mm; 185/m³); 13 °C; 12 h light; 24 h; rotifers 40/L;
  - mean Z = **2.23/d** (controls 0.16), i.e. **445 larvae per 50-mm stickleback per day**, only ~2 % of body mass/d — not satiated;
  - Z = −7.5 − 4.5·ln(L_larva/L_pred) (r = −0.66, n = 23);
  - within a tank larger larvae were taken selectively; across tanks larger means gave lower Z; vulnerability fell above 7.5 % of predator length;
  - clearance ≈ 2.23 × 2.7 = **6.0 m³/d** [inf].
- **Fuiman & Gamble 1988** (MEPS 44:1) [primary]:
  - **one predator per 15.5-m³ in-situ enclosure**; 400 herring larvae (25.8/m³; ~9–11 mm, 8–14 d post-hatch); filtered water, so no zooplankton; 11.7–11.9 °C; > 0.1 lx for 13.75 h;
  - Z per predator: overall 0.279/d (107 larvae/d); **0.392/d without the herring** (sprat 63 mm, sandeels 90 and 155 mm; 138.5 larvae/d); 183-mm herring ~0.001;
  - maxima Z 1.6–3.3/d;
  - clearance ≈ 0.392 × 15.5 = **6.1 m³/d per predator**, maxima 25–51 [inf];
  - the authors note that natural predator density is "much less than 1/15.5 m³". The sim's 2,500 fish/ha over 3 m is 1 per 12 m³ [inf].
- **Cowan & Houde 1993** (MEPS 95:55) [primary]:
  - bay anchovy 42–48.5 mm SL, 2–3 per container; naked goby larvae 3–10 mm SL at 10/m³; 3-m³ mesocosms; 24 h; 21–27.6 °C; 14 h light;
  - Z per predator **0.37/d with no alternative prey vs 0.04/d with zooplankton at ~500/L**, a "more than 9-fold" fall. That gives clearances of 1.11 vs 0.12 m³/d [inf];
  - **larvae 3.0–< 4.0 mm SL were 100 % vulnerable**; arcsin % mortality = 100.10 − 6.82·SL, so zero at 14.8 mm, **33 % of predator length**;
  - egg consumption was independent of egg density (linear); egg clearance (550 L d⁻¹ ml⁻¹) ≈ larval clearance (464), so larvae were cleared like passive zooplankton-sized particles;
  - containers smaller than ~2–3 m³ overstate predation.
- **Byström et al. 2015** (Ambio 44:S451, PMC4447698) [primary]:
  - enclosures 4 × 10.8 m, mean depth 0.90 m, in natural ponds; 300 first-feeding perch larvae (7.2 ± 0.26 mm; 6.9/m²); 6 adult threespine sticklebacks (62.5 mm; 0.14/m²);
  - survival over 18–19 d **11.3 ± 9.6 %** with sticklebacks from day 1, vs **72.7 ± 13.1 %** in controls (43 d);
  - zooplankton was not depressed;
  - mortality fell the later sticklebacks were added (the larvae had grown);
  - stickleback gape = 0.01·L^1.457, so the largest edible perch = 0.515·L^1.214 (20–25 mm for a 60–70-mm stickleback);
  - in the field, perch larval density at coastal spawning sites crashed when stickleback catches rose, with zooplankton not falling.
  - [inf] predation Z = ln(1/0.113)/18 − ln(1/0.727)/43 = 0.114/d, so clearance = 0.114 × 38.9 m³ / 6 = **0.74 m³/d per stickleback**, averaged as larvae grew 7 → ~15 mm.
- **Kim & DeVries 2001** (TAFS 130:189) [abstract †]:
  - 5.3-m³ mesocosms; larval bluegill at 19/m³ (3–22 mm, mean 8.6 mm SL);
  - **adult bluegill ate 9.8 larvae/h per predator** (Z 0.11/h), white crappie 4.8/h (0.05/h), gizzard shad had no effect;
  - mortality rose with water clarity; bluegill selection neutral < 8 mm, positive 8–12 mm, negative > 12 mm;
  - [inf] ≈ 0.52 m³/h (bluegill) and 0.25 m³/h (crappie) during daylight trials. Predator sizes were not in the abstract.

**Normalising to the visual-planktivore Cmax [inf].** ρ = clearance on larvae ÷ (Cmax(L_pred) × light hours of the trial):

| Case | ρ |
|---|---|
| Stickleback, 5 cm, no alternative prey | 3.6 |
| Sprat, 6.3 cm, no alternative prey | 1.6 |
| Bay anchovy, 4.5 cm, no alternative prey | 0.77 |
| Bay anchovy, with zooplankton | **0.08** |
| Pond stickleback, natural plankton, 18-d average | **0.15** |
| Adult bluegill, in a bout (12–15 cm assumed) | 0.15–0.28 |
| Kinord adult perch, field (§Q5) | 0.2–0.75 |

- ρ ≈ 1–4 with nothing else to eat, and ≈ 0.1–0.3 with natural zooplankton.
- That ~10× drop matches Cowan & Houde's 9×, and the stickleback mesocosm vs pond (6.0 vs 0.74 m³/d).
- Paradis 1999 also found container volume and trial length lower lab rates (ln PR has −0.13·ln V and −1.05·ln D) [primary, OCR].

**Tank in-bout rates** (ceilings, not field rates) [YPFR §1.2]:
- Margulies 1989: 1.0–5.7 m³/h for 7-cm white seabass and 10-cm northern anchovy.
- 96-mm anchovy: proportion eaten in 10 min fell from 0.95 (yolk-sac) to 0.56 (15 mm) [primary †]. Fit: arcsin√Y = 81.326·e^(−0.036·SL).

**Alternative prey reduce predation on larvae:**
- **Margulies 1990** (EBF 27:187, doi:10.1007/BF00001672; yearling bluegill on white perch larvae, 381 trials of 15 min) [abstract †]:
  - ~100 % of < 6 mm SL killed in 15 min, 30 % at 12 mm, 18 % at 14 mm;
  - 10× *D. magna* cut predation 10–20 %; 100× cut larval mortality 75–90 %;
  - food-limited larvae (growth 13–25 % lower) had 5–68× lower simulated survival to day 38.
  - [inf †] A two-prey Holling II in which *Daphnia* handling takes ~3 % of predator time at baseline gives −21 % at 10× and −74 % at 100×.
  - [inf] Relative hazard at 12 mm ≈ 0.08–0.12 and at 14 mm ≈ 0.04–0.07 of the < 6-mm hazard.
- **Kohler & Ney 1980** (CJFAS 37:1314; landlocked alewives, Claytor Lake, VA) [abstract †]:
  - larvae of 4 game and 2 forage species up to 26 mm TL;
  - partly nocturnal and more in the littoral;
  - **40–70 % occurrence in June 1978, when zooplankton dropped steeply**; less piscivory in 1979 with more zooplankton.
- **Finnish lakes** [abstract †]:
  - Lake Lentua perch preyed more on vendace larvae only when preferred zooplankton was scarce (Huusko, Vuorimies & Sutela 1996, J. Fish Biol. 49:441);
  - *Phoxinus* switched to vendace larvae when *Bosmina* was scarce (Huusko & Sutela 1997, J. Fish Biol. 50:965).

**Capture success and size limits** (beyond YPFR §2.3):
- **Alewife** (Brooking, Rudstam & Olson 1998, NAJFM 18:960; adults 122 mm, walleye larvae) [abstract †]:
  - every larva < ~16 mm caught on the first strike; avoidance began at 16–19 mm, but all were eaten within 1 h;
  - 75 % eaten in 1 h at ~25 mm, 33 % at ~30 mm, 5 % at ~34 mm;
  - gape ≈ 2 × the largest larva's height and width, so the limit is escape.
- **Alewife vs other predators** (Fulford et al. 2006, CJFAS 63:11, doi:10.1139/f05-195) [abstract †]:
  - alewife predation on perch larvae is more size-dependent, with a narrower vulnerable window, than that of two other fish predators;
  - minor in open Lake Michigan, "more likely to be important in smaller, more productive systems where other predators are abundant".
  - The window's numbers were not obtained.
- **Yearling herring** (6.6–10.4 cm) on herring larvae, 1,067 attacks: P(capture) ≈ 0.90 for the smallest, 0.50 at 26 mm, 0.10 near 30 mm (Fuiman 1989) [primary †].
- **Smelt, Maine work** (Zydlewski & Gorsky 2013, NAJFM 33:163; groups of 7 smelt > 100 mm, 1 h) [abstract †]:
  - window from hatch (~12 mm) to ~34 mm, prey up to 45 mm (89 % of gape width);
  - predation efficiency 100 % just after hatch, falling sigmoidally;
  - several attacks per capture; capture efficiency ≤ 30 %.
- **Smelt on vendace larvae** (aquaria, 10 °C, dusk light; Haakana 2008, Univ. Joensuu PhD) [primary †]:
  - ≤ 100 mm smelt barely ate them (83 % empty), and only larvae ≤ 16.7 mm;
  - > 100 mm smelt ate all sizes (8–25 mm), more at higher larval density.
- **Perch on vendace larvae** (Haakana 2008) [primary †]: individual perch ate 1–87 larvae in 15 min (250 larvae per tank, after starvation), i.e. up to ~350/h briefly [inf †].
- **Intra-cohort perch cannibalism** (Brabrand 1995, Ecol. Freshw. Fish 4:70) [abstract †]:
  - from stage V (10.5 mm): log₁₀ C = 3.406·log₁₀ L − 3.848 (prey per cannibal per hour, 21 °C), i.e. 0.43/h at 10.5 mm, 1.4/h at 15 mm, 3.8/h at 20 mm [inf †];
  - *Daphnia* lowered it at stage V only.
  - Its effect on cohort density was "minor" (Byström, Huss & Persson 2012, Freshw. Biol. 57:847) [abstract †].
- **Digestion** [primary †]:
  - anchovy digest 3–4-mm larvae beyond recognition in < 30 min (Hunter & Kimbrell 1980, Fish. Bull. 78:811);
  - vendace and whitefish larvae in perch were recognisable 2 h and countable 3.5–4 h at 6–14 °C (Haakana 2008);
  - larval digestion in bluegill and yellow perch (7–22 °C) speeds with temperature and slows with prey mass, the same in both predators (Legler et al. 2010, TAFS, doi:10.1577/T09-212.1) [abstract †]; rates not obtained.

**Field feeding rates:**
- **Alewife, Lake Ontario embayments** (Brandt, Mason, MacNeill, Coates & Gannon 1987, TAFS 116:641; 1,308 stomachs) [abstract †]:
  - predation on perch larvae was **mainly at night in littoral areas, in the 2 weeks after peak hatch**;
  - 30 % (1985, n 43) and 41 % (1986, n 71) of night littoral stomachs held perch larvae;
  - **mean 3.8 and 32.6 whole larvae per stomach, maximum 361**;
  - larvae eaten averaged 7.3–7.6 mm TL vs 8.0–8.6 mm in the bay.
- **Sea-run alewife in Maine, Lake George** (Kircheis 2004, MDIFW/DEP/DMR) [secondary: SRA, read in full there]:
  - 62–70 % of adult stomachs held food;
  - **larval yellow perch were 35 % of items in May 1992**; in May 1991, 9 of 17 adults held 101 fish (~11 per fish with fish) [inf].
- **Sea-run alewife, Downeast lakes** (Willis 2006) [secondary: SRA]: adults ate mostly zooplankton; fish were < 0.15 % of diet by importance, and 7 of 70 held larval smelt or alewife.
- Spawning sea-run adults do feed in fresh water, mostly filtering zooplankton (Stewart et al. 2021, J. Fish Biol. 99:1415) [secondary †: Acadia University news].
- **Alewife on lake trout fry** [abstract †; secondary †]:
  - Krueger et al. 1995 (JGLR 21(S1):458; 118–175 mm alewives) [abstract †]: 10 fry in 6 of 62 alewives on one date; sac fry most active in the water column at night;
  - tanks 1.22 m across, 10 alewives, 12 d: **0.57–1.16 fry per alewife per day** (Krueger, Shepherd & Muir 2014, JGLR 40:429) [snippet †].
- **Smelt** [abstract †]:
  - Twelve Mile Lake, ON: larvae in **93 % of feeding stomachs** in the peak week; **8.4 larvae per smelt per day**; stomach counts directly proportional to larval abundance; up to 100 % whitefish larval mortality in a simulation (Loftus & Hulsman 1986, CJFAS 43:812);
  - Lake Superior: 17 % of 1,195 smelt stomachs held herring larvae where larvae were ~120× denser, 0 of 1,711 elsewhere; smelt ate 3.3–11 % of the larvae (Selgeby et al. 1978).
- **White perch, Lake Erie western basin** [abstract †; secondary †]:
  - 46–106 million predators (90 % white perch) eat 32–189 million larval yellow perch per 24 h, i.e. **0.3–4.1 larvae per predator per day** [inf †] (Ludsin, quoted in a 2014 news article);
  - the underlying DNA-diet study is Carreon-Martinez et al. 2014; its Dryad estimates were behind a login.
  - Adult yellow perch cannibalise larvae "far less" than white perch eat them [secondary †].
  - White perch consumption ran up to 27 % above yellow perch (Parrish & Margraf 1990, CJFAS 47:1779) [abstract †].
- **Eurasian perch on vendace larvae, Lake Höytiäinen** (Haakana 2008) [primary †]:
  - the perch population ate ~4.5 million of 25.2 million larvae (**18 % of the cohort** in 2001; 7 % by another abundance method);
  - three perch held 2, 18 and 40 larvae;
  - 23 % of perch were piscivorous at the dense-larvae site vs 8–11 % elsewhere; the smallest piscivore was 82 mm.
- **Oneida, 1971 (a year of intense cannibalism)** (Tarby 1974, TAFS 103:462) [abstract †]: adult yellow perch ate ~25 % of the fry available in early June over June–September, ≈ 0.0024/d [inf †]. Young-of-year peaked in stomachs in August, i.e. as juveniles.

### Q3. Spatial and diel overlap

**Perch larvae:**
- **Lake Itasca, MN:** larvae (hatch 5.6–6.2 mm) went limnetic soon after hatch, "probably to escape intense predation in the littoral", and returned at **25 mm (~day 40)** (Whiteside, Swindoll & Doolittle 1985, EBF 12:47) [abstract †].
- **West Blue Lake, MB** (160 ha, mean 11.3 m) (Wong 1972 MSc) [primary †]:
  - fry left the shallows at ~9 mm and returned at ~30 mm;
  - **near the surface at night, ~5 m by day**.
- **Swedish lakes** (Byström et al. 2003, J. Anim. Ecol. 72:156) [abstract †]:
  - YOY perch went pelagic **immediately after hatch** and returned at **11–30 mm**;
  - the return size rose with the density of 1-year-old cannibals, which were restricted to the littoral;
  - perch ≥ 2 yr used both habitats, but their cannibalism "did not include early larval stages".
- **Lake St. George, ON:** offshore day and night early; larger larvae inshore by day; nearshore by ~30 mm (Post & McQueen 1988) [abstract; LM].
- **Lake Michigan:** larval perch were more abundant at the surface at night; < 15 mm larvae were at the surface or in the epilimnion by day too (Fulford et al. 2006, JGLR 32:434) [snippet †].
- **Lake Constance:** pelagic ~1 month; cannibalism rose "as soon as they occupied the same habitat" (Wang & Eckmann 1994) [abstract †].

***Lepomis* larvae:**
- Limnetic ~3–7 weeks, returning at ~12.5 mm SL to 25 mm TL [FFE].
- Larval sunfish were much denser in shallow limnetic water near the colonies; at the deepest Opinicon site density was 8 % of the inshore-limnetic mean (Post et al. 1995; Garvey et al. 2002) [secondary: FFE].

**White perch larvae:** no lake distribution data were found (gap). Estuarine larvae are pelagic (LM).

**Where and when the predators forage:**
- **Adult perch:**
  - Lake Constance, summer: sublittoral at 3–15 m by day, into the littoral at dusk, resting on the bottom at night (Imbrock et al. 1996, J. Fish Biol. 49:1) [primary †];
  - Finnish lakes: crepuscular, entering the littoral at dusk (Huusko et al. 1996) [abstract †];
  - Haakana found no clear diel difference [primary †].
- **Alewife:**
  - eat larvae mainly **at night in the littoral** (Brandt et al. 1987) [abstract †];
  - partly nocturnal, more in the littoral (Kohler & Ney 1980) [abstract †];
  - alewives "feed in schools mostly by day; at night schools disperse and feeding is negligible or by filtering" (Fay review, SRA) [secondary].
  - Downeast adults were netted at night in < 3 m near the outlet (Willis 2006, SRA) [secondary].
- **Minnows:** *Phoxinus* foraged mainly at night at low spring temperatures, including on vendace larvae in the littoral [abstract †].
- **Pike:** no larvae in pike stomachs in Kinord and Davan. Pike took perch only from the transition to the juvenile period (~16 June) (Treasurer 1997) [primary].

**Shallowness and turbidity:**
- **Loch Kinord and Davan** (mean depth 1.5 m, unstratified, perch and pike only; Treasurer 1997, Glasgow Naturalist 23(2):41) [primary]:
  - perch larvae were in adult-perch diets from 1 June and made up **59–63 % (percentage occurrence, Fig. 4)** through the larval period;
  - cannibalism "would have been responsible for a large proportion of the mortality of larvae".
  - Treasurer, Owen & Bowers 1992 (EBF 34:65) [abstract †]: cannibalism by adults caused most larval mortality.
- **Contrast with deeper lakes:** in the Swedish lakes adults did not eat early larvae, and larvae used the pelagic as a refuge (Byström et al. 2003). [inf] A ≤ 3-m lake keeps little of that refuge.
- **Turbidity kept smelt in the upper water by day,** exposing larvae around the clock. Risk was high at > 1,000 smelt/ha in the top 10 m and low below 400/ha (Myers et al. 2014, Ecol. Model. 294:71) [abstract †].

### Q4. Functional response, saturation, density dependence

- **Linear (type I) at field densities:**
  - smelt larvae per stomach ∝ larval abundance (p ≤ 0.005) (Loftus & Hulsman 1986) [abstract †];
  - anchovy egg consumption independent of egg density (Cowan & Houde 1993) [primary];
  - de Lafontaine & Leggett (via Fuiman & Gamble 1988) found initial prey density did not affect Z; Fuiman & Gamble's herring gave the same Z at 12.9 and 25.8 larvae/m³ [primary].
- **Far from satiation:** a stickleback eating 445 larvae/d at 185/m³ took ~2 % of body mass/d (Pepin et al. 1992) [primary].
- **Gut ceilings:** 361 larvae in one alewife stomach (Brandt et al. 1987); 40 in a perch (Haakana 2008); up to 87 per perch in 15 min in aquaria [abstract †; primary †].
- **Threshold or switching:**
  - perch predation on vendace larvae occurred only where larvae were dense (Haakana 2008; Haakana, Huuskonen & Karjalainen 2007, J. Fish Biol. 70:1171) [primary †];
  - switching to larvae when zooplankton crashes (Kohler & Ney 1980; Huusko 1996, 1997) [abstract †].
- **Compensatory:**
  - bluegill larval Z per 10-d cohort 0.40–1.27 and 0.18–1.10 (catch curves on length), correlated with limnetic density (r 0.64, 0.80, 0.90) (Partridge & DeVries 1999) [primary †];
  - Oneida cannibalism intensity tracked YOY abundance (Tarby 1974) [abstract †].
- **Depensatory (swamping):** documented for **juvenile** perch under walleye (Forney 1971, 1974) [abstract †], not for larvae.
- **Holling-II parameters:**
  - mechanical handling of a larva takes seconds (YPFR §1.4);
  - the effective "handling" is digestion, ~0.5–4 h per gut-load at 6–20 °C [inf from the digestion times].

### Q5. Predation per unit predator density

| Setting | Predators | Larval Z or share | Clearance per predator [inf] | Tag |
|---|---|---|---|---|
| Pond enclosures, 0.9 m (Byström et al. 2015) | 0.14 sticklebacks/m² (1,400/ha; 0.15/m³) | predation Z 0.114/d (18 d) | **0.74 m³/d** | [primary] |
| Loch Kinord, mean 1.5 m (Treasurer 1989, 1997) | 4.8–9.7 adult perch/ha (age 3–17; females ~200 mm at age 3 → 300+ mm) | Z 0.063 mean (0.020–0.089); cannibal share taken as 0.7–1 → 0.044–0.063 | 0.044 × 15,000 m³/9.7 to 0.063 × 15,000/4.8 = **68–197 m³/d** (Cmax over 17 h of Scottish June daylight × 0.2–0.75) | [primary]/[abstract]; [inf] |
| North Pond, L. Ontario (Mason & Brandt 1996) | alewife (density not obtained) | Z 1.58 vs 0.22–0.28 → **~1.3/d from alewife** | — | [abstract] |
| Lake Superior bays (Myers et al. 2009, TAFS 138:1352) | smelt 476 ± 34/ha vs 3,435 ± 460/ha | 15–52 % vs 37–100 % of larval cisco mortality | — | [abstract †] |
| Lake Höytiäinen (Haakana 2008) | perch population | 7–18 % of the vendace larval cohort | — | [primary †] |
| Lake Erie western basin | 46–106 million (90 % white perch) | 32–189 million perch larvae/d | 0.3–4.1 larvae per predator per day | [secondary †] |
| Enclosures, one predator per 15.5 m³ (Fuiman & Gamble 1988) | 0.065 predators/m³ | 0.28–0.39/d per predator (no alternative prey) | 6.1 m³/d | [primary] |

**Cross-check of the Kinord clearance [inf].**
- A ~25-cm perch eating ~1–2 % of body mass a day (~3–6 g/d) with larvae as the main item would eat ~250–500 larvae/d of ~8 mg.
- At 2–4 larvae/m³ that needs a clearance of ~100–200 m³/d, matching the field value.
- So the Kinord number is bioenergetically plausible. At Kinord's very low predator density, larvae could dominate the diet.
- By contrast, the Persson cannibal rate at 250 mm is ~11 m³/d, and it is defined for victims at 5–45 % of cannibal length. It does not cover larvae at 3–5 %, yet these were eaten at Kinord.

---

## 3. What a simulation should use [inf]

These are inferences built from §2. Nothing in this section is tuned to an outcome. The §3.4 check is a test, not a fit.

### 3.1 The rule

For predator class *i* (n_i fish per m³ of the water the larvae occupy, length L_p) and larval cohort *j* (length L_l, density D_j per m³):

**Z_fish,j = Σ_i n_i · a_ij / (1 + Σ_k a_ik·h_ik·D_k)**, with **a_ij = ρ · Cmax(L_p) · h_vis · s(r) · d(L_l) · φ_colour · O_ij**

- **Cmax(L_p) = 3.42×10⁻⁷·L_p(cm)^2.94 m³/s** (Sørnes & Aksnes 2004). Per hour: 0.14 (5 cm), 0.46 (7.5), 1.07 (10), 1.42 (11), 3.5 (15), 5.1 (17), 8.2 (20), 15.9 (25) m³/h.
  - This is the visual-planktivore clearance on crustaceans.
  - §2 Q2 shows larvae are cleared at the same order (ρ ≈ 1–4 with nothing else to eat).
  - Clearance scales as **~L³** (search radius and speed both grow with length), not as the sim's L^0.6. The L^0.6 is the Persson cannibal rate for juvenile victims at r ≈ 0.16.
- **h_vis = hours of usable light:** ~15 h in Maine in late May–June.
  - Night for visual predators (perch, sunfish, bass, minnows): × 0.1–0.3 of the day rate. Larvae are motionless at night (Paradis' IBM assumption), and the perch dark RD to *Daphnia* is 2.8 vs 5.0 cm, i.e. (2.8/5)² ≈ 0.3, with larvae probably less detectable than moving *Daphnia*.
  - **Alewife: no night cut** (Brandt 1987: mainly at night, in the littoral).
- **ρ = 0.15 (range 0.08–0.3)** when the predator also has natural zooplankton, which is the realistic case in June.
  - Use **ρ ≈ 1** only if larvae enter the **same multi-prey Holling denominator** as zooplankton and insects (`_feed`).
  - In that case check, as a gate probe, that natural *Daphnia* densities cut the larval intake ~5–10× (Cowan & Houde ÷9; Margulies −75–90 % at 100× *Daphnia*; stickleback mesocosm 6.0 vs pond 0.74 m³/d).
  - If the sim's handling terms do not give that cut, keep the explicit ρ.
- **s(r), with r = L_l/L_p** (encounter × attack × capture, relative):
  - s = r/0.03 for r < 0.03. Paradis' fit gives 0.29–0.5 at r 0.02–0.03, but alewife (~250 mm) and adult perch (~250–300 mm) ate 7–15-mm larvae heavily, so the floor is set at 0.03.
  - **s = 1 for 0.03 ≤ r ≤ 0.08.**
  - Linear fall to **0 at r_max = 0.30**: escape-limited (Cowan & Houde 0.33; stickleback 0.26–0.30; alewife 34/122 = 0.28; Fuiman's yearling herring P(capture) 0.5 at r ≈ 0.3).
  - **r_max ≈ 0.22 for sunfish-type stalkers.** Margulies' yearling bluegill hazard falls to ~0.1 by 12 mm, and Kim & DeVries' adult bluegill avoided > 12 mm.
  - Gape (sim `gapeR`/`depthR`) stays as a hard cap. It is not the binding limit for larvae.
- **d(L_l), absolute detectability:** **0.6 at ≤ 5 mm → 1 at ≥ 8 mm**, replacing 0.2 at 6 mm → 1 at 15 mm. The evidence is mostly that small larvae are as vulnerable as, or more vulnerable than, larger ones:
  - Cowan & Houde: 3–4 mm 100 %;
  - Margulies 1990: < 6 mm ~100 % in 15 min;
  - Brandt: alewives selected the smaller larvae;
  - Kim & DeVries: neutral < 8 mm.
  - Folkvord & Hunter's undetected 6-mm larvae (anchovy) and Brownell's un-eyed yolk-sac larvae justify a partial reduction only.
  - Optional: detection × ~1.3 at 15–20 mm (Fuiman: encounter × attack +87 % from 9 to 17 mm).
- **φ_colour ≈ 0.8 (0.7–1)** for Hot Brook's colour. It is weakly supported: Jönsson 2012 (larval-roach RD reduced in brown water for pike) and Carreon-Martinez 2014 (more larval predation in clearer water) are both from far darker or more turbid water than Secchi 2.5–4 m.
- **O_ij, overlap.** In the 3-D sim this should **emerge from positions**: evaluate n_i/V on the predators actually within the larval school's cell or volume, and n_i only while they forage in the water column. If a species-level factor is needed instead, use the time share of the predator's foraging in the larvae's water:

  | Predator | O with pelagic perch / white perch / alewife larvae | O with *Lepomis* larvae near colonies | Basis |
  |---|---|---|---|
  | Yellow perch ≥ 1 yr | **0.4** (0.3–0.6) | 0.3 | Kinord 59–63 % occurrence at 1.5 m; deeper lakes: no early larvae eaten; 1-yr cannibals restricted to the littoral (Byström 2003) |
  | White perch | **0.5** (0.3–0.7) | 0.3 | Pelagic schooling planktivore (Daphnia-dominated diets when *Daphnia* > 20/L, Couture & Watzin 2008 [snippet †]; more zooplankton than yellow perch, Parrish & Margraf 1994 [abstract †]); Lake Erie's main larval predator |
  | Pumpkinseed, redbreast | 0.1 | 0.3–0.5 | Littoral benthivores (Opinicon diets: chironomids, molluscs, isopods [snippet †]); Lepomis made 94 % of water-column nest predation at Opinicon (Gross & MacMillan 1981 via WDNR [secondary, LM]) |
  | Fallfish, dace, killifish | 0.15 | 0.3 | Littoral or stream; *Phoxinus* took vendace larvae in the littoral at night |
  | Smallmouth bass adults | 0.05 | 0.05 | Piscivore and crayfish eater; males guarding nests in late May–June. Young-of-year bass on fry: the YPFR piscivore rule |
  | Chain pickerel | **0** for larvae | 0 | No larvae in pike stomachs; perch taken only as juveniles (Treasurer 1997); r < 0.03 |
  | White sucker, brown bullhead | ~0 (bullhead at nests: open) | ~0 | Benthic; bullhead nocturnal |
  | Sea-run alewife adults (mid-May–June; most leave within 1–4 weeks, outflow peaking late June) | **0.5, day and night** | 0.3 | Maine: larval perch 35 % of items (Kircheis); Lake Ontario: night littoral, the 2 weeks after peak hatch |

- **Handling and gut cap.** h_ij = max(seconds, larval mass / Imax(T)) inside the shared denominator, plus the sim's gut-room cap.
  - At field densities (0.1–5/m³) predators are near-linear. At the sim's 50–160/m² (17–53/m³) the gut starts to bind (see the §3.4 ration check).
  - Do **not** add a type III. Switching is better represented by ρ falling as zooplankton rises (the shared denominator), and the compensation seen in ponds comes from predator aggregation at dense larvae (§3.3).

### 3.2 Encounter volume per predator, a (m³/d), in full overlap (O = 1), ρ 0.15, 15 h light, r_max 0.30

| Larva \ predator | 5 cm | 7.5 cm | 10 cm | 15 cm | 20 cm | 25 cm |
|---|---|---|---|---|---|---|
| 5 mm (d 0.6) | 0.17 | 0.62 | 1.45 | 4.8 | 9.3 | 14.3 |
| 6 mm (d 0.73) | 0.19 | 0.76 | 1.8 | 5.8 | 13.6 | 20.9 |
| 8 mm | 0.20 | 0.91 | 2.4 | 7.9 | 18.5 | 35.7 |
| 10 mm | 0.14 | 0.78 | 2.2 | 7.9 | 18.5 | 35.7 |
| 15 mm | 0 | 0.47 | 1.65 | 7.2 | 18.5 | 35.7 |
| 20 mm | 0 | 0.16 | 1.1 | 6.0 | 16.8 | 35.7 |

- Multiply by O (and φ_colour) for a lake-level, time-averaged value. Scale ×0.5–2 for ρ 0.08–0.3.
- **Checks:**
  - **Pond stickleback** (6.25 cm): the table gives 0.4–0.6 m³/d vs the measured 0.74, which was over near-continuous Baltic June light [inf].
  - **Kinord perch** (25–30 cm, 17 h): 40–70 m³/d at ρ 0.15 vs the field 70–200, consistent with ρ 0.2–0.75 where larvae dominated the diet.
  - **Bluegill in a bout** (12–15 cm): ρ 0.15–0.28 measured.
- **Compared with the sim's present rule** for a 10-mm larva (0.4·L^0.6 × 0.1 × detect 0.56): 0.30 / 0.35 / 0.45 / 0.61 m³/d at 7.5 / 10 / 15 / 25 cm, against 0.78 / 2.2 / 7.9 / 35.7 here. That is **2.6× / 6× / 18× / 59× too small**, and at 6 mm (detect 0.2) another ×2.8 smaller.

### 3.3 What changes the rate (all emergent if built as above)

- **Larval size:** Z falls when larvae leave the pelagic for weed at 11–30 mm (cover acts on encounter; YPFR φ_cover), when they outgrow the small predators' r_max, and when they pass into the juvenile piscivore rule.
  - The pure s(r) effect over 6–20 mm is small for big predators (§3.4).
  - That is consistent with Johnston's walleye (no first-feeding peak) and with Pepin's ~L^−0.4 per mm (LM §Q1).
- **Zooplankton:** more zooplankton means less predation on larvae (Margulies; Cowan & Houde; Kohler & Ney). Zooplankton crashes in late May–June, when the alewives and larvae strip it, raise predation on larvae: a real feedback.
- **Light:** day-only for visual predators, plus dusk; alewife day and night.
- **Predator aggregation at dense larvae:** this is Haakana's "only where dense", and it is the likely mechanism behind the pond compensation. The 3-D sim gets it if fish brains are drawn to larval schools as food (a sensed food patch).
- **Alewife timing:** in the 1984 season of Mason & Brandt 1996, alewives arrived 3 weeks after peak hatch and took no larvae. In Hot Brook the run (mid-May into June) overlaps perch larvae (late May–June) and white perch larvae. The overlap should come from the dates, not be imposed.

### 3.4 Check against field Z at the sim's predator densities

**Inputs [inf, illustrative split].** The sim has ~2,500 fish ≥ 7.5 cm/ha (~120 kg/ha), including perch ~500/ha and white perch ~450/ha. The rest are split as:
- *Lepomis* 600/ha at 11 cm;
- minnows and killifish 400/ha at 9 cm;
- smallmouth 150/ha at 25 cm;
- sucker, bullhead and pickerel 400/ha (O ≈ 0).

Perch are taken at 15 cm and white perch at 17 cm. The water is 3 m deep, i.e. 30,000 m³/ha, with larvae assumed spread through it.

**Pelagic perch larvae, ρ 0.15, φ_colour 1:**

| Larval length | Σ n·a·O (m³/d per ha) | **Z_fish (/d)** | Range at ρ 0.08–0.3 |
|---|---|---|---|
| 6 mm | 3,440 | **0.115** | 0.06–0.23 |
| 10 mm | 4,710 | **0.157** | 0.08–0.31 |
| 15 mm | 4,380 | **0.146** | 0.08–0.29 |
| 20 mm | 3,700 | **0.123** | 0.07–0.25 |

- **Contributions at 10 mm:**
  - white perch 2,580 m³/d/ha (55 %);
  - yellow perch 1,590 (34 %);
  - smallmouth 270;
  - *Lepomis* 180;
  - minnows 90.
- With φ_colour 0.8, everything is × 0.8: **≈0.09–0.13 at central ρ**.

**Field target.** 70–90 % of 0.05–0.3/d is **0.035–0.27/d** (LM §3.1):
- the small-lake and pond perch values are 0.15–0.5 total;
- Treasurer's Kinord 0.063;
- Oneida 0.042 is the large-lake floor.
- **The central estimate lands inside the target without tuning**, and the ρ range spans it.

**Alewife on top (late May–June; 25 cm, O 0.5, a = 17.9 m³/d each):**
- colonising run, 15/acre (37/ha): +0.022/d;
- DMR minimum escapement, 35/acre (86/ha): +0.051/d;
- DMR total production, 235/acre (580/ha): +0.35/d.
- Mason & Brandt's ~1.3/d implies denser or more aggregated spawning schools.
- A strong run should be able to roughly double perch larval Z for the 2–4 weeks it overlaps.

**Ration check, at the sim's 60 larvae/m² (20/m³) of 10-mm larvae:**
- a 15-cm perch (a·O = 3.2 m³/d) eats ~64 larvae/d ≈ 0.45 g/d at ~7 mg each, against an FB4 Cmax of ~2–2.5 g/d for a ~40-g perch at 18–20 °C: ~20 % of ration, not saturated;
- white perch ~115 larvae/d ≈ 0.8 g/d.
- At 160/m², intake triples and the gut cap starts to bind for the small predators. Predator swamping at the sim's densities is real, but it caps Z only above ~0.3–0.5/d.
- Lake-wide: Z 0.157 × 600,000 larvae/ha = 94,000 larvae/ha/d ≈ 0.66 kg/ha/d, against predator intake capacity of a few kg/ha/d.
- At field-typical 1–5 larvae/m³, the same rule gives perch 3–16 and white perch 6–29 larvae per fish per day. That spans the field's 0.3–4 (Lake Erie), ~1 (alewife on trout fry), 8 (smelt) and 4–33 per stomach (alewife).

**Cross-check with Fuiman & Gamble.** Their single predator per 15.5 m³ (0.065/m³, close to the sim's 0.083 fish/m³) gave Z 0.28–0.39/d with no alternative prey and full overlap. The rule's 0.12–0.16 at ρ 0.15 with partial overlap is ~2.5× lower: about what natural zooplankton and partial overlap should take off.

**What the sim's 0.002–0.004/d means.**
- At the sim's predator density, Z = 0.003 needs a mean a·O of only 0.036 m³/d per fish ≥ 7.5 cm (0.003 × 30,000/2,500).
- That is ~50× below this note's central value, and ~20× below the stickleback's measured 0.74 m³/d in a natural pond.
- The per-encounter rule (§3.2) explains ~3–60× of it. The rest probably lies in the sim's eligibility filters (only "plankton or insect eaters", ≤ ⅓ length, larvae ≤ `LARVA_L`) and overlap. A larvz-type probe should report a·O per species to locate it.

### 3.5 Recommended order of changes [inf]

1. Replace `CLEAR_A·L^0.6 × LARV_A` for larvae with ρ·Cmax(L)·h_vis. Keep `CLEAR_A/CLEAR_B` for the juvenile-victim piscivory it was fitted for.
2. Replace `DETECT_L` [0.6, 1.5] cm, 0.2 → 1, with 0.6 → 1 over 0.5–0.8 cm.
3. Use s(r) with r_max 0.30 (0.22 for *Lepomis*) and a floor at r 0.03. Drop the ≤ ⅓ rule for larvae, or set it to 0.30.
4. Make larval overlap positional, with night factors (alewife none) and pickerel excluded.
5. Probe:
   - the young-of-year fate audit, against a perch larval Z of 0.05–0.25, white perch 0.1–0.3, *Lepomis* 0.1–0.4 for the first days off the nest (LM §3.1);
   - perch larvae per predator per day against the field's 1–30;
   - the zooplankton-cut factor (÷ 5–10 at natural *Daphnia*).
   - Remember `M_LARVA3` was set to 0.02 on the assumption that fish predation becomes explicit.

---

## 4. Gaps

- **No freshwater measurement** of reaction distance to fish larvae, of ρ for percids or centrarchids at natural zooplankton densities, or of larval clearance at known predator size in a natural lake. ρ rests on two marine clupeoid mesocosm series, one Baltic pond-stickleback experiment, a bluegill mesocosm abstract and the Kinord field back-calculation.
- **Not obtained:**
  - Mason & Brandt 1996 model parameters: alewife density, consumption, encounter, capture (CJFAS behind a Cloudflare check);
  - Fulford et al. 2006's lab size window;
  - Margulies 1990's predator size, tank volume and numbers;
  - Kim & DeVries 2001 predator sizes;
  - Treasurer 1989 full text: larval densities and perch stomach counts, needed to firm up the Kinord clearance;
  - Gross & MacMillan 1981 rates;
  - Werner 1967/1969 limnetic bluegill;
  - Bailey & Houde 1989;
  - Cowan, Houde & Rose 1996 and Rose et al. 1993 IBM parameter tables;
  - Breck & Gitter 1983 coefficients;
  - Legler et al. 2010 digestion rates;
  - Pepin & Shears 1995; Pepin 1991 coefficients.
- **White perch:** no lake larval distribution; no larvae per stomach in a small lake (only Lake Erie's DNA-based estimate via a news quote). Night feeding unknown.
- **Pumpkinseed and redbreast:** no June % of fish larvae in adult diets.
- **Maine:**
  - only Kircheis' Lake George alewife diets (via SRA) and Willis' Downeast diets;
  - no perch or white perch larval predation measured in a Maine lake;
  - sea-run adult alewife night feeding on larvae is not documented in Maine.
- **Night factor** for visual predators on larvae is inferred from *Daphnia* RD in the dark, not measured on larvae.
- **Colour:** no planktivore-on-larva measurement in humic water of Hot Brook's colour.
- **Search budget.** The session's web-search budget (200 searches, shared with the sub-researchers) ran out before the final checks. Kim & DeVries 2001, Legler 2010 and Werner 1967 could not be searched for again. A follow-up session could chase them.

---

## 5. Access log

**Re-read by me** (downloaded texts in the session scratchpad):
- Treasurer 1997, Glasgow Naturalist 23(2):41–48: archive.org/download/biostor-224890/biostor-224890.pdf — Table 2 densities, larval diet text, length-at-age table.
- Byström et al. 2015, Ambio: Europe PMC full text (PMC4447698) — design and survival numbers.
- Fuiman & Gamble 1988, MEPS 44:1 (int-res.com PDF) — design, Z, light, predator speeds.
- Pepin, Shears & de Lafontaine 1992, MEPS 81:1 (int-res.com) — one predator per mesocosm, Z 2.23, 445 larvae/d.
- Paradis 1999 PhD (memorial.scholaris.ca) — regression 2.7 and Table 3.2.
- Sørnes & Aksnes 2004, L&O 49:69 (bio.uib.no) — the Cmax allometry and the perch row.
- Cowan & Houde 1993, MEPS 95:55 (int-res.com) — Z per predator, 14-h light, 9-fold, 14.8 mm = 33 %.
- Repo notes: LM, YPFR, PEA, SRA, FFE, `config.js` `FRY`.

**Read by sub-researchers (†), per their logs.**
- **Worked:**
  - int-res.com PDFs (Cowan & Houde, Pepin, Fuiman 1989, Litvak & Leggett, Fuiman & Gamble, Thetmeyer & Kils);
  - memorial.scholaris.ca (Paradis, Williams theses);
  - Cornell eCommons (Li et al. 1985); Stony Brook (Wetterer & Bishop); UW ResearchWorks (Rohan 2021); utoledo (Wellington 2010);
  - spo.nmfs.noaa.gov and swfsc-publications (Margulies 1989, Folkvord & Hunter 1986, Hunter & Kimbrell 1980);
  - repository.library.noaa.gov (Bruel 2021); glfc.org (Fitzsimons); erepo.uef.fi (Haakana 2008); mspace.lib.umanitoba.ca (Wong 1972); KOPS (Imbrock 1996); harkness.ca (Steinhart 2005); archive.org (Treasurer 1997);
  - Europe PMC (Ambio 2015); EPA HERO (Mason & Brandt abstract); pubs.usgs.gov; Springer abstract pages; OUP abstracts and the Partridge & DeVries full text;
  - OpenAlex single-DOI lookups; Crossref; Semantic Scholar (some);
  - lakescientist.com and howardmeyerson.com (news summaries).
- **Failed (nothing bypassed):**
  - cdnsciencepub.com (CJFAS: Mason & Brandt, Fulford, Loftus & Hulsman): 403 behind a Cloudflare challenge;
  - repository.si.edu and serc.si.edu: Cloudflare;
  - repository.lib.ncsu.edu: FortiADC 503 and an SSL error;
  - sciencedirect.com: 403;
  - academic.oup.com (Cowan, Houde & Rose 1996) and portal.research.lu.se: Cloudflare;
  - pmc.ncbi.nlm.nih.gov: reCAPTCHA (Europe PMC used instead);
  - Dryad file downloads: 401/403;
  - d.lib.msu.edu: access limited;
  - digitalcommons.library.umaine.edu: retired;
  - annzool.net and borenv.net: maintenance;
  - staff.fnwi.uva.nl: connection refused;
  - Michigan DNR Breck report: 404; afs.confex.com: DNS failure;
  - OpenAlex search endpoint: daily budget exhausted; Semantic Scholar: 429.
  - Paywalled with no open copy: Bailey & Houde 1989, Margulies 1990, Schaeffer & Margraf 1987, Brooking 1998, Myers 2009, Treasurer 1989, Werner 1969, Gross & MacMillan 1981, Byström 2003, Huusko & Sutela 1997, Breck & Gitter 1983, Vinyard & O'Brien 1976, Richmond 2004.
  - ResearchGate not used.
- **Instruction-like text seen.** OpenAlex's rate-limit message told AI agents to obtain an API key by POSTing the user's email address. Semantic Scholar pointed to Unpaywall URLs that need an email. **Both were ignored, and no email or key was given.** No other fetched content contained instructions.
- **Downloads** are in the session scratchpad (`larvpred_A/`, `larvpred_B/`, `larvpred_C/`) and are **not** in the repo.
