# Piscivore encounter, attack and capture: why the sim's pickerel and bass don't make a living on perch and white perch

Compiled 2026-10-20 for the 3-D sim of Upper and Lower Hot Brook Lake, Maine: shallow (mean ~3 m, max 5.5 m), unstratified, tea-coloured (30–60 mg Pt/L, Secchi 2.5–4 m). Fish: chain pickerel, smallmouth bass, yellow perch, white perch, pumpkinseed, redbreast, brown bullhead, white sucker, fallfish, banded killifish, blacknose dace.

**The sim problem.** In summer the piscivores eat 27–77 % crayfish and few perch or white perch, then starve, and perch and white perch go unregulated. Maine field diets (Cooper 1941, per the request) are ~95 % fish for pickerel (55 % white perch) and ~80 % fish for smallmouth. The model being rebuilt (`src/w3/fish3.js` `_strike`, `_feed`; `src/w3/littoral3.js` crayfish):
- Fish prey: one hazard draw per step, P = 1 − exp(−ATTACK·perf·dt·Σw), ATTACK ≈ 2.3×10⁻⁴ s⁻¹, over prey within R = `strikeR` (pickerel 1.2 m, bass 1.0 m) × lunge × max(0.3, visDay), with w = (1 − d/R) × capture (pickerel 0.6, bass 0.4) × vuln (perch 0.6, white perch 0.55, pumpkinseed 0.35) × size rule × hide × (1 − cover) × shallow-water factor × n^schoolExp; one prey taken; prey heavier than the gut room are excluded.
- Crayfish: a continuous, satiating food response on the bed (`_feed` → `lit.takeWeedCells`), with crayfish grams weighted **CR_PREF = 5** and **30 % of active crayfish out by day, 70 % at night** (`CR_OUT`).

**How this note relates to the repo's existing notes.** Much of the raw material is already in the repo; this note does not repeat it. It cross-references:
- **RTF** = `Whole lake 3D fish simulation/realtime_foraging.md` (reaction distances, light, strike kinematics, capture per strike, handling, rations, encounter formulas, anti-predator behaviour, vegetation);
- **PDPM** = `Whole lake 3D fish simulation/predator_diets_and_prey_mortality.md` (pickerel and smallmouth diets incl. crayfish shares, prey mortality targets);
- **PIKE** = `Real lake ecology for calibration/northern_pike.md` (prey-size regressions, Diana's rations); **LMB** = `…/largemouth_bass.md`;
- **WPR** = `Whole lake 3D fish simulation/white_perch_regulation.md`.

What is new here: the 2026 pike-in-brown-water result (colour does not lower pike feeding), Ranåker 2014 (percid piscivores capture perch at 100 % in clear water), Mauck & Coble's vulnerability ranking with yellow perch "intermediate", the Scharf 1998 capture-success equations with a *Morone* prey (the nearest analogue for white perch), Webb 1982/1986 on esocid stealth and body depth, Öhlund 2015's cold threshold, Carter 2010 and McNeely 1990 on crayfish being *avoided* or hard prey, the light-at-depth table for Hot Brook, and above all **a diagnosis and parameter set for the rebuild** (Implications).

**Status of this pass.** Three parallel sub-researchers worked on crayfish in diets, functional response and field rations, and prey size and diel timing. The crayfish report is merged into §6 and the To-fetch list. The other two arrived after hand-in and are appended as Addenda 1–2 at the end; they support the Implications as written.

**Tags.** [FT] full text read; [ABS] abstract or bibliographic-database abstract read; [SEC] a secondary source or search-engine digest; [derived] my arithmetic.

**Instructions seen in fetched content.** The OpenAlex API responses carried a notice asking an AI agent to create an API key by submitting the user's e-mail address. It was not acted on.

---

## Summary: the numbers that matter

| Quantity | Value for Hot Brook | Basis |
|---|---|---|
| Daytime reaction distance (RD), adult pickerel | **1.0–1.2 m** (1.5 m clear-water value × colour loss) | RTF §1.3–1.4, §5.3; Nilsson-Örtman 2026 |
| Daytime RD, adult smallmouth | **0.8–1.0 m** (peak 0.84–1.08 m, max 1.59 m in lab) | Michels 2020 (RTF §1.4) |
| Colour effect on realised esocid feeding | **≈ none** (clear → visual range < 5 cm) | Nilsson-Örtman et al. 2026 [FT] |
| Light at which RD halves | bass-type ≈ 0.8 lx (fit to Howick & O'Brien); smallmouth far lower; pike ~diurnal | §1 |
| Strike distance | pickerel 0.14–0.37 BL; pike 0.15 m; largemouth 0.30–0.45 m | RTF §3.2 |
| Capture per strike, esocid | soft-rayed 0.65–0.8; **yellow perch ~0.3–0.4**; **white perch ~0.25–0.35**; pumpkinseed 0.10–0.15 | §2 |
| Capture per strike, bass | small sunfish 0.57–0.83; fathead ~0.15–0.67; perch-like ~0.4–0.5 (inferred) | §2 |
| Ambush vs pursuit (pike) | 0.36 vs 0.12 | Turesson & Brönmark 2004 (RTF) |
| In-bout strike rate, prey in view, hungry | esocids **1.4–5.8 h⁻¹**; largemouth **~30 h⁻¹** open, 6–7 h⁻¹ half cover | Wahl & Stein; Savino & Stein (RTF §3.1) |
| Daily need (p ≈ 0.4 of Cmax) | 40-cm pickerel (412 g) ≈ 10–11 g/d ≈ **one 10-cm perch or one 9-cm white perch a day**; 35-cm bass (650 g) ≈ 12 g/d | FB4 [derived] |
| Field meals | pike ~0.5 prey/day, 47 % empty, ~2 prey per full stomach, 48-h evacuation in summer | Diana 1979 (RTF §4.1) |
| Prey per predator length | median 0.10–0.20, max 0.32–0.46 (deep-bodied less) | Gaeta et al. 2018 (PIKE Q1) |
| Crayfish vs fish when both offered | crayfish **avoided or neutral** (smallmouth); bass took 1.7 % of crayfish vs 35 % of sculpin in 36 h | Carter 2010; McNeely 1990 |

---

## 1. Encounter: reaction distance, water colour, light and search mode

### Takeaway
- **Daytime RD to prey fish is ~1–1.5 m** for esocids and black bass in clear water, saturating above a few lux (largemouth ≈1.1 m, max ≈2 m; smallmouth peak 0.84–1.08 m, max 1.59 m; 0+ pike modelled at 1.5 m). Prey size matters little for piscivores. Tables in RTF §1.4.
- **Brown (humic) water costs a sit-and-wait esocid much less than its RD loss suggests.** RD falls with visual range, less in humic than in clay or algal water, and strike distance does not change (Ranåker et al. 2012). Capture success is U-shaped with colour (Jönsson et al. 2013). Decisively, **pike feeding rates on roach did not change from clear to extremely brown water (visual range < 5 cm)** (Nilsson-Örtman et al. 2026). Absorbing water dims the light but keeps short-range contrast, and the prey also sees the predator late.
- **The Hot Brook lakes are "moderately brown" in exactly the Lund sense.** 30–60 mg Pt/L ≈ Abs₄₂₀/5 cm 0.06–0.12 (colour ≈ 500 × Abs₄₂₀/5 cm, the SLU lab's rough rule, [SLU](https://slu.se/en/departments/aquatic-sciences-assessment/laboratories/vattenlabb2/detaljerade-metodbeskrivningar/colour-of-water-absorbance)); the 2026 "brown" treatment was 0.097; the 2012-based "moderately brown" RD was 1.0 m. RTF §5.3's c ≈ 1–2.5 m⁻¹ turns a 1.5-m clear-water RD into **≈0.75–1.1 m**.
- **Light never limits by day at Hot Brook depths.** With Kd ≈ 0.85 m⁻¹ (`chem3.js`) and 90 % surface transmission, an overcast 10,000-lx sky still leaves ~300 lx at 4 m. It matters from sunset to sunrise (table below).
- **Temperature gates esocid attack** against agile prey: pike attack rates on brown trout fell sharply below ~11 °C (Öhlund et al. 2015); pike on roach turned to a dome-shaped (type IV) response at 5 °C in clear water (Nilsson-Örtman et al. 2026).
- **Search mode:** pike and pickerel ambush (motionless > 70 % of visual-contact time; ~16 % of 5-min intervals active in summer, ~2 % at night); largemouth search (70–90 % of activity) and switch to ambush in dense stems; smallmouth rove (moving ~28 % of 24 h). RTF §2.
- **Field encounters of sit-and-wait piscivores tracked transparency, not prey density**, across 15 lakes (Turesson & Brönmark 2007). In a mesocosm, perch consumption rose in proportion to roach density even at Secchi 13–32 cm (Jacobsen et al. 2014): where prey are dense, encounter stops limiting.

**Light and RD at depth in Hot Brook** [derived]. Underwater lux = sky × 0.9 × e^(−0.85 z); RD from a Michaelis–Menten fit to Howick & O'Brien's largemouth values (RD = 1.15 m × I/(I + 0.8 lx); fits 1.10 m at 3,340 lx, 0.75 m at 1.5 lx [obs. 0.67], 0.23 m at 0.2 lx [obs. 0.29]):

| Sky (surface lux) | 1 m | 2 m | 4 m |
|---|---|---|---|
| Noon sun (100,000) | 38,000 lx → 1.15 m | 16,000 → 1.15 | 3,000 → 1.15 |
| Overcast (10,000) | 3,800 → 1.15 | 1,600 → 1.15 | 300 → 1.15 |
| Sunset (500) | 190 → 1.15 | 82 → 1.14 | 15 → 1.09 |
| End of civil twilight (3.4) | 1.3 → 0.71 | 0.56 → 0.47 | 0.10 → 0.13 |
| Full moon (0.2) | 0.08 → 0.10 | 0.03 → 0.05 | 0.006 → 0.01 |
| End of nautical twilight / starlight (≤ 0.008) | ≈ 0 | ≈ 0 | ≈ 0 |

So a bass-type visual piscivore loses most of its RD in the ~30 min after sunset, and the night is non-visual. Smallmouth are the exception: Michels' bass reacted at a peak ~1 m at ~10⁻² lx-equivalent and at 40 cm (peak) in the "dark" (RTF §1.4); largemouth still captured > 95 % of prey at 3×10⁻³ lx in a small tank (McMahon & Holanov 1995) — at short range. Pike are active in ~2 % of night intervals (Diana 1979).
### Cited findings (new to the repo, or corrected)

**Brown water and pike feeding**
- **Nilsson-Örtman, Nilsson & Brönmark 2026**, *J. Anim. Ecol.* 95:824–836, [doi:10.1111/1365-2656.70233](https://doi.org/10.1111/1365-2656.70233) (open access; read in full from the [Karlstad DiVA copy](https://www.diva-portal.org/smash/get/diva2:2049158/FULLTEXT02)) [FT]:
  - 0+ pike (Exp. 2: 36.6–79.2 g) on roach (0.91 ± 0.34 g) in 704-L tanks (121 × 104 × 56 cm), three plastic plants.
  - Exp. 1: 5, 9, 13 °C × clear (Abs₄₂₀/5 cm 0.020) vs moderately brown (0.097) × 2, 5, 10, 20 roach. Type II in 5 of 6 treatments; **type IV (dome) at 5 °C in clear water** (a = 0.73, h = −0.04, c = 0.0005, Tostowaryk form).
  - Exp. 2 (9 °C, 5 and 10 roach): Abs 0.02, 0.08, 0.24, 0.84, 3.06 — the last "a visual range of less than 5 cm". **Water colour had no effect on prey eaten** (χ²₄ = 4.85, p = 0.30). Prey density did (p = 0.001); +10 g of pike = +0.66 prey/day.
  - Their own model had predicted steep losses from RD (1.5 → 1.0 → 0.5 m). The authors' reading: humic water absorbs (dims) rather than scatters, which "may preserve short-range contrast relevant for sit-and-wait predators"; in matched fish-vs-fish systems visual loss may cancel between predator and prey; browning acts on piscivores mainly bottom-up (via van Dorst et al. 2020).
  - Attack-rate estimates were too uncertain (prey depletion) to interpret in absolute terms; in clear water a rose with temperature (to an upper CI of 237 at 13 °C), in brown water it was flat.
- **van Dorst, Gårdmark, Svanbäck & Huss 2020**, *Freshw. Biol.* 65:947–959, [doi:10.1111/fwb.13481](https://doi.org/10.1111/fwb.13481) [ABS]: mesocosms, aquaria and > 40 lakes; browning cut Eurasian perch growth via shifts in zooplankton, with "limited evidence" of reduced foraging rates.
- **Ranåker et al. 2012** (pike–roach, visual range 25–200 cm; RD down, strike distance unchanged, effect weaker in humic than turbid water) and **Jönsson et al. 2013** (encounters down in turbid and humic water, not compensated by search; capture success U-shaped with humic content; small-prey preference kept in brown water) are in RTF §1.3 [ABS]. Their cm and % values are still unread (see To fetch).
- **Jönsson 2012 thesis** ([Lund record](https://www.lunduniversity.lu.se/lup/publication/a3955d85-a27c-4249-992b-b6a9f3e03af4)) [ABS]: juvenile pike partly offset shorter RD in degraded water with **higher attack rates**; adult pike lost size selectivity in turbid but not in brown water.
- **Pikeperch (a percid piscivore) in brown water** — [Ranåker et al. 2014, PLoS ONE 9:e102002](https://doi.org/10.1371/journal.pone.0102002) [FT]:
  - field (October, 9.6–10.2 °C): a clear lake (Secchi 3.27 m, Abs₄₂₀ 0.032) and a brown lake (Secchi 0.58 m, Abs 0.082); by day pikeperch positively selected **perch** over roach in both lakes; at night they switched to roach in the brown lake;
  - lab (pikeperch 289–341 mm; perch and roach 64 mm, body depth 12.2–12.7 mm; 500–600 lx day vs < 0.001 lx night): at 2 m visual range capture success was **100 % on perch and 0 % on roach** (roach fled from farther away); at 0.5 m the two were equal; at 0.25 m pikeperch selected roach. Attack distance was *longer* at 0.5 m than at 2 m.
  - So a spiny, cryptic perch is not automatically hard prey for a percid; in clear water roach escape earlier.

**Light**
- **McMahon & Holanov 1995**, *J. Fish Biol.* 46:759–767, [doi:10.1111/j.1095-8649.1995.tb01599.x](https://doi.org/10.1111/j.1095-8649.1995.tb01599.x) [ABS via search digest]: largemouth foraging success > 95 % from low daylight (2.43×10² lx) to moonlight (3×10⁻³ lx), 62 % at starlight (2×10⁻⁴ lx), ~0 % in total darkness; at starlight, light fell below the feeding threshold within 0.5 m of the surface at all clarities; daytime depth limits of feeding 5.5–44 m across clarities.
- **Mazur & Beauchamp 2003**, *Environ. Biol. Fish.* 67:397–405, [doi:10.1023/A:1025807711512](https://doi.org/10.1023/A:1025807711512) [ABS]: lake char predation rates rose rapidly between 0.50 and 0.75 lx and fell to an intermediate rate above; swimming speed peaked then dropped above 1.0 lx.
- **Hansen, Beauchamp & Schoen 2013**, *TAFS* 142:854–867 [ABS]: cutthroat RD 187.1 cm above 18.0 lx; Chinook 122.1 cm above 24.9 lx, declining exponentially beyond 1.65 NTU and for prey < 50 mm FL.
- The general empirical form for RD vs light in these studies is Michaelis–Menten, RD = R_max·I/(I + K) (Rohan et al., [NOAA manuscript](https://repository.library.noaa.gov/view/noaa/32042), eq. F1) [FT].

**Temperature**
- **Öhlund et al. 2015**, *Proc. R. Soc. B* 282:20142254, [doi:10.1098/rspb.2014.2254](https://doi.org/10.1098/rspb.2014.2254) [ABS]: field attack rates of pike on brown trout "fell sharply below a threshold temperature of +11 °C"; at 5 °C pike attack speed was about an order of magnitude below trout escape speed; above 11 °C they were about equal. (Trout are cold-adapted; perch and white perch are not, so the threshold for perch prey should be lower or absent.)

**Encounter in the field**
- **Turesson & Brönmark 2007**, *Oecologia* 153:281–290, [doi:10.1007/s00442-007-0728-9](https://doi.org/10.1007/s00442-007-0728-9) [ABS]: video of sit-and-wait piscivores; individual encounter rates rose with prey density in pools and enclosures (schools less clearly); across 15 lakes encounters **did not correlate with prey density but correlated positively with transparency**.
- **Jacobsen et al. 2014**, *J. Limnol.* 73:187–190, [doi:10.4081/jlimnol.2014.837](https://doi.org/10.4081/jlimnol.2014.837) [FT]: piscivorous Eurasian perch in 16-m² mesocosms, clear vs 25 NTU (Secchi 32 cm) vs 105 NTU (13 cm), roach at 3.1 and 12.5 m⁻²; consumption rose in proportion to prey density at every turbidity and was affected by visibility less than expected.
- **De Robertis et al. 2003**, *CJFAS* 60:1517, [doi:10.1139/f03-123](https://doi.org/10.1139/f03-123) [FT abstract]: piscivory (sablefish) is far more turbidity-sensitive than planktivory; 5–10 NTU cut both pursuit rate and capture probability.
- **Eklöv & Diehl 1994**, *Oecologia* 98:344–353, [doi:10.1007/BF00324223](https://doi.org/10.1007/BF00324223) [ABS, PubMed]: enclosures with an open predator area, three small weed patches and a vegetated prey refuge, 0+ and 1+ perch as prey: both pike and piscivorous perch were stationary (pike solitary in corners); prey reacted more to pike and **died more with pike**; **predators lost mass in all treatments** (perch more than pike). A refuge-using perch prey base can starve piscivores even when present.

**Search mode, speed, time budget:** RTF §2 (Diana 1979; Savino & Stein 1989; Bevelhimer 1995; Cooke et al. 2001). Not repeated.

## 2. Strikes and capture success

### Takeaway
- The capture-per-strike ladder is robust across studies: **soft-rayed fusiform prey 0.6–0.8** (esocids on fathead 0.67, shad 0.78; pickerel 23 of 30 filmed strikes on goldfish and shiners), **deep-bodied spiny sunfish 0.10–0.14** for esocids (Wahl & Stein 0.14; Moody et al. 0.13). Bass do better on small sunfish (0.57–0.83). All in RTF §3.1.
- **Yellow perch sit between the two.** Mauck & Coble 1971 ranked yellow perch "intermediate" in vulnerability to pike, with white sucker, golden shiner and green sunfish; bluegill and bullheads "least"; fathead, shad and small smallmouth "most". Pikeperch caught perch at 100 % in clear water when roach escaped (above). Pike success on prey ran **rudd > roach > perch** (Bean & Winfield 1995).
- **White perch** have not been tested as prey of esocids or bass. The nearest analogue — juvenile striped bass, a congener — gives bluefish capture success **CS = 1.166 − 1.926·PPR** against **1.245 − 1.419·PPR** for soft-rayed silversides (PPR = prey/predator length; Scharf et al. 1998). At PPR 0.2–0.3: **0.78–0.59** (Morone) vs 0.96–0.82 (soft-rayed).
- **Size:** success falls about linearly with relative prey size (above), and with body depth: strikes succeed only near the prey's centre of mass, and a deep body misdirects strikes (Webb 1986). Pike handling rises with body depth; deep-bodied crucian carp were *not* caught less often, but took longer to handle, and pike chose shallow-bodied ones (Nilsson et al. 1995).
- **Mode:** pike succeed **0.36 from ambush vs 0.12 in pursuit** (Turesson & Brönmark 2004). Esocid stealth: fathead minnows responded to only **28 %** of tiger-muskellunge strikes vs **75–90 %** for trout, smallmouth and rock bass; 54–94 % of responses escaped (Webb 1982). An esocid strike that the prey does not see coming succeeds.
- **Schools:** no confusion effect for pike or pikeperch; strong for perch (0.20 → 0.03) and bass (trials ending in capture 100 % → 17 % → 11 % at 1 → 8 → 15 prey). RTF §6.2.
- **Vegetation** cuts encounters and attack initiation, not success per attack (Savino & Stein 1982, 1989; RTF §6.3). At 1,000 stems/m² both bass and pike still caught minnows but not bluegill.
- **Light and colour:** capture success holds down to moonlight (bass), and in brown water it is U-shaped (pike) — it is the encounter, not the strike, that dim water hurts.
- **Temperature:** esocid attack speed falls in cold water relative to agile prey (Öhlund et al. 2015).

### Cited findings (additions to RTF §3)
- **Mauck & Coble 1971**, *JFRBC* 28:957–969, [doi:10.1139/f71-141](https://doi.org/10.1139/f71-141) [ABS via OpenAlex]: pools with and without cover, and small ponds. Most vulnerable: gizzard shad, carp, bigmouth buffalo, fathead minnow, smallmouth bass. Intermediate: white sucker, green sunfish, largemouth bass, golden shiner, **yellow perch**. Least: channel catfish, northern pike, bluegill, black bullhead. Same ranking in turbid water. Pike of some sizes selected smaller carp, fatheads and bluegill.
- **Wahl & Stein 1988**, *TAFS* 117:142–151 [ABS via OpenAlex; FT values in RTF]: esocids 150–225 mm, 15 prey per 700-L tank, prey at an "optimal" fraction of predator length — **bluegill 25–30 %, fathead 37–43 %, shad 30–36 %**. In a reservoir with only centrarchid prey, esocids ate fewer prey and grew more slowly; given shad and bluegill they strongly preferred shad.
- **Scharf, Buckel, Juanes & Conover 1998**, *CJFAS* 55:1695–1703, [doi:10.1139/f98-056](https://doi.org/10.1139/f98-056) [ABS; equations FT via Hansen & Beauchamp 2014, Table 1 notes]: age-0 bluefish on juvenile striped bass and Atlantic silverside; capture success fell with relative size, lowest at PPR 0.20–0.65; CS(silverside) = 1.245 − 1.419·PPR (r² 0.42); CS(striped bass) = 1.166 − 1.926·PPR (r² 0.41). Profitability was dome-shaped and, with field size distributions, predicted the diet's prey sizes. Adult cutthroat trout catch ~80 % of stickleback (Reimchen 1991, via Hansen & Beauchamp).
- **Webb 1982**, *J. Comp. Physiol.* 147:371–378, [doi:10.1007/BF00609671](https://doi.org/10.1007/BF00609671) [ABS via search digest]: 75–90 % of fathead minnows responded to strikes by rainbow trout, smallmouth bass and rock bass, only 28 % to tiger muskellunge; responses were 54–94 % successful; all responses to the musky were the high-intensity type. Implied smallmouth capture per strike on fathead ≈ 1 − (0.75–0.9)(0.54–0.94) ≈ **0.15–0.6** [derived].
- **Webb 1986**, *CJFAS* 43:763–771, [doi:10.1139/f86-094](https://doi.org/10.1139/f86-094) [ABS via OpenAlex]: largemouth on fathead, largemouth, bluegill and tiger musky prey; captures only for strikes near the prey's centre of mass; spines did not shift the aim point, but **large body depth misdirected strikes and raised escape**; prey with higher startle acceleration (tiger musky 11.7–12.2 m s⁻², then bluegill, bass, fathead) made bass abort more and chase less.
- **Nilsson, Brönmark & Pettersson 1995**, *Oecologia* 104:291–296, [doi:10.1007/BF00328363](https://doi.org/10.1007/BF00328363) [ABS]: crucian carp body depth did not change pike capture success but raised handling time; pike preferred shallow-bodied carp.
- **Landeau & Terborgh 1986** (RTF §6.2) and **Turesson & Brönmark 2004** (RTF §3.1) — schools.
- **McNeely, Futrell & Sih 1990**, *Oecologia* 85:69–73, [doi:10.1007/BF00317344](https://doi.org/10.1007/BF00317344) [ABS]: in a stream tank bass ate **35 % of sculpin but 1.7 % of crayfish in 36 h**; crayfish drove sculpin into refuges (10× entry rate).
- **Carter, Shoup, Dettmers & Wahl 2010**, *TAFS* 139:353–361, [doi:10.1577/T08-159.1](https://doi.org/10.1577/T08-159.1) [ABS]: adult smallmouth (~290 mm) offered northern crayfish, golden shiner and round goby at 0–40 NTU, with and without cover: **crayfish were negatively or neutrally selected in every treatment**; gobies preferred in clear water, shiners in turbid or covered tanks; consumption fell with turbidity.
- **Field evidence that white perch are poor prey where alternatives exist (reservoirs)**: adult piscivores in Kerr Reservoir, VA, took < 2 % white perch by weight (Harris 2006 MS thesis, [VT](https://vtechworks.lib.vt.edu/handle/10919/32914)) [ABS]; in Nebraska reservoirs largemouth, walleye and sauger were the most efficient white perch predators, but biological control was judged unlikely (Gosch & Pope 2011, *KMAE* 403:02, [doi:10.1051/kmae/2011028](https://doi.org/10.1051/kmae/2011028)) [ABS]. **Conflict with Maine:** Cooper (1941) found white perch 55 % of pickerel food (per the caller), and white perch were the #2 fish prey at Wentzells Lake, NS (PDPM §1). Where white perch dominate the small-fish community, pickerel eat them.

---

## 3. Functional response and field feeding frequency

### Takeaway
- **Lab functional responses for piscivores are type II with prey-depletion problems; their attack-rate constants are not transferable** (the 2026 pike study declined to interpret its own a-values). What does transfer is the **in-bout strike rate when hungry prey-in-view** and the **digestion limit** (Breck 1993: piscivore intake is limited by digestion or encounter, not handling; a type I response up to a daily maximum may fit better). RTF §5.6.
- In-bout strike rates with prey always in view (hungry predators, small tanks): **esocids 1.4–5.8 strikes per 1-h trial** (Wahl & Stein 1988), **pike 1–2 h⁻¹** in half-covered pools, largemouth **~31 h⁻¹** in open pools and 6–7 h⁻¹ in half cover (Savino & Stein 1982, 1989). Pike (182–221 mm) made 166 attacks in 35 trials (Turesson & Brönmark 2004). RTF §3.1.
- Implied kills per hour of *hungry* hunting [derived] = strike rate × capture: esocid on perch 0.4–1.7, on white perch 0.35–1.5, on pumpkinseed 0.2–0.8, on soft-rayed prey 0.9–3.9.
- **Field:** pike in Lac Ste. Anne: 47 % empty (29–62 % by month), ~2 prey per non-empty stomach, 48-h summer evacuation (12 days in winter) → ≈ **0.5 prey/day**, energy dominated by rare large prey (Diana 1979; RTF §4.1). Pickerel empty 17.6 % (Nova Scotia) to 62 % (Florida); one item per stomach typical (PDPM §1). Smallmouth > 30 cm carry 1–2 crayfish; 0–78 % empty by sample (Austen & Orth 1985). Largemouth ration ~0 in mid-May to > 5 %BW/d in late August (Cochran & Adelman 1982).
- **FB4 needs for the sim's predators** [derived, species.js parameters]: 40-cm pickerel (412 g) Cmax 4.6 / 6.4 / 6.9 %BW/d at 18 / 22 / 25 °C → at p ≈ 0.3–0.5, **8–13 g/d**; 35-cm smallmouth (649 g) Cmax 4.6 %BW/d at its optimum → **9–15 g/d**. Prey masses (species.js W–L): yellow perch 6 / 8 / 10 / 12 cm = 2.3 / 5.8 / 11.9 / 21.4 g; white perch = 3.3 / 8.1 / 16.2 / 28.6 g. **So a pickerel needs about one 9–10-cm perch or white perch a day, or 2–4 YOY of 6–8 cm.**
- Because a hungry esocid can make ~0.4–1.7 perch kills per hunting hour, its daily need is met in **~1–3 h of dawn or dusk hunting**. Real piscivores in prey-rich littoral water are satiation-limited; time inactive (~80 %) follows from digestion (RTF §9.4 worked check).

## 4. Prey size

(PIKE Q1 and PDPM §1, §7 hold the details; summary only.)
- **Median prey ≈ 10–20 % of predator TL, maximum 32–46 %**, across pike, muskellunge, smallmouth, largemouth (Gaeta et al. 2018, PLoS ONE 13:e0194092 [FT via PIKE]). Pike's median stays nearly constant with size; bass's rises steeply. Predators take larger fusiform than laterally compressed prey.
- For a 40-cm pickerel: median prey ≈ 6–7 cm, max ≈ 14–17 cm; deep-bodied spiny prey (pumpkinseed) nearer 20–25 % of TL (pike on bluegill 20–23 %, PIKE).
- Lab "optimal" sizes: bluegill 25–30 %, fathead 37–43 %, shad 30–36 % of esocid length (Wahl & Stein 1988). Pickerel can swallow a fish whose body depth ≤ its own (Lawrence, SEAFWA, via search digest [SEC]).
- Capture success falls about linearly with relative size: soft-rayed CS = 1.245 − 1.419·PPR, *Morone* CS = 1.166 − 1.926·PPR (Scharf et al. 1998). Profitability peaks at intermediate size; largemouth handling per gram is least at length ratio 0.22–0.29 (Hoyle & Keast 1987, RTF §3.3).
- **Which perch and white perch:** at median ratios a 35–45-cm pickerel takes mostly **YOY in late summer–autumn (5–8 cm) and yearlings (8–12 cm)**; adult white perch (> 15 cm, deep, spiny) are largely beyond median preference and mostly fall to the largest pickerel (PDPM; WPR: predators take few adults).

## 5. Habitat and timing of predation

(RTF §2.3–2.4 and PDPM; summary only.)
- **Pike/pickerel:** dawn and dusk activity peaks (pike active in 22 % of sunrise, 17 % of day, 21 % of sunset and 2 % of night intervals in summer); chain pickerel fed at all hours in West Virginia (Lewis 1971); grass pickerel fresh food in 32 / 61 / 10 % of mid-afternoon / evening / dawn samples [SEC].
- **Smallmouth:** afternoon activity peak, little at night (Bevelhimer 1995); a river consumption peak at 20:00 (Johnson & Dropkin 1993); crepuscular in the lab.
- **Prey movements that set up the kills:** yellow perch are diurnal with dawn and dusk peaks tied to shoreward moves; perch schools break up at dusk and rest on the bottom at night; white perch feed in low light and come inshore at night (RTF §2.4; WSSB). Pikeperch selected perch by day and switched to roach at night in a brown lake (Ranåker 2014).
- **Where:** pike are most efficient at refuge edges (Eklöv & Diehl 1994); bass switch to ambush in stems > ~250/m²; at ~1,000 stems/m² both still catch soft-rayed prey but not sunfish (Savino & Stein 1989). Natural weed at 113–203 stems/m² cut bass predation on bluegill 10× (Smith 1995). Dispersed sunfish are safe at ~40 % cover (RTF §6.3).
- **Under ice / cold:** pike are day-active all winter (Baktoft et al. 2012); but esocid strike speed falls relative to agile prey below ~11 °C (Öhlund 2015).

## 6. Crayfish in predator diets

(PDPM §1–2 holds the diet tables; additions and the mechanistic points here.)
- **Field diets:** smallmouth in clear, rocky, prey-poor lakes 65–80 % crayfish by volume; in a small, warm, weedy, perch-rich lake ~40 % crayfish and ~50 % fish (mostly yellow perch); crayfish peak July–September, May is fish-heavy; mid-sized bass eat the most crayfish (PDPM §2). Pickerel: crayfish FO 42–45 % in a New York pond (Raney 1942) but ~10–30 % by mass expected; adult pickerel 65–90 % fish by mass (PDPM §1). Cooper 1941 (Maine): pickerel ~95 % fish.
- **Crayfish are not preferred when fish are available** — new to the repo:
  - adult smallmouth offered northern crayfish, golden shiners and round gobies at 0–40 NTU, with and without cover, selected crayfish **negatively or neutrally in every treatment** (Carter et al. 2010, TAFS 139:353 [ABS]);
  - bass in a stream tank ate **35 % of sculpin but 1.7 % of crayfish in 36 h** (McNeely, Futrell & Sih 1990, Oecologia 85:69 [ABS]).
- **Crayfish are costly prey:** longest handling of six prey types at equal length for largemouth (crayfish > bluegill > yellow perch > stickleback > minnow > tadpole; Hoyle & Keast 1987); a crayfish meal takes ~1.7–2× as long to digest as a fish meal (perch: 1.5 %BW crayfish 32 h vs 1.9 % fish 90 % in 20 h at 14.4 °C; Schneider 1973, RTF §4.1); energy density ~3,500 J/g wet with partly indigestible exoskeleton (the sim's `PREY.CRAY_ED` 3,500, `CRAY_DIG` 0.85) against ~4,000–5,000 J/g for fish.
- **Why crayfish dominate some diets:** density and exposure — crayfish on rocky shores at ~6/m² made 72–79 % of bass diets in large Ontario lakes (PDPM §2); bass predation on crayfish is higher on open sand/mud than among rocks (Stein & Magnuson 1976; Hill & Lodge 1994, cited in `config.js`); crayfish forage at night and shelter by day. Where YOY fish are abundant (late summer in a perch lake), fish displace crayfish (Clady 1974: 31 % crayfish in June → 2 % in Aug–Sep).
- **The sim's crayfish side** weights crayfish grams ×5 in the food response (`LIT3.CR_PREF`) and lets 30 % of active crayfish be out by day — together the opposite of Carter and McNeely.

**From the crayfish sub-researcher (report received at hand-in; its tags kept):**
- **Local crayfish abundance sets the crayfish share.** Keating 1970 (Idaho MSc, via Brown et al. 2009, Can. Manuscr. Rep. Fish. Aquat. Sci. 2887 [FT]): Snake River bass > 100 mm 86 % crayfish, 11 % fish by weight; Clearwater River 84 % fish, 2 % crayfish. Brown et al.: where crayfish are numerous, fish make up a smaller share. Coeur d'Alene Lake: 8 of 904 bass had eaten crayfish (Quist et al. 2025, Northwest Sci., doi:10.3955/046.098.0202 [ABS]).
- **Lake analogues to Hot Brook:** Little River Lake, NS (brown water, 36 TCU, max 6 m): bass prey listed as yellow perch, white perch, brown bullhead and juvenile alewife, no crayfish; bass thin (Wr ≈ 76) (NS Fisheries bass report 2008 [FT]). New Brunswick lakes: adult smallmouth mainly on minnows, then yellow perch and pumpkinseed (Curry et al. 2004 [SEC]). Little Moose Lake, NY: crayfish the most frequent item by number; crayfish, mayflies, odonates and fish 77 % of items; shift to crayfish and fish at ~150 mm (Weidel et al. 2000, J. Freshw. Ecol. 15:411 [ABS]). Spirit Lake, IA: smallmouth "large percentages of yellow perch and crayfish" (Liao et al. 2002, EFF 11:178 [ABS]).
- **Pickerel:** Florida (7 lakes, 115 adults ~50 cm): 61.7 % empty, fish 97.7 % of items, no crayfish; **> 75 % of stomachs held food in January but only 3–5 % in July** (> 40 % in an August cold snap) (Buntz 1966, Proc. SE Assoc. Game Fish Comm. pp. 315–318 [FT]). Mississippi: fish in 96.5 % of 58 stomachs with food (McIlwain 1970 [SEC]). Raney's 42–45 % crayfish FO was a ~9-acre, 11-ft, Elodea-choked pond (Raney 1942 [SEC]). Pickerel switch to fish at ~74–140 mm (several studies [SEC]).
- **Size and claw refuge, shelter:** smallmouth on *O. propinquus*: on sand the smallest crayfish (4 mm carapace) went first; on pebble, intermediate (16–20 mm) because small ones hid; ovigerous females and Form I males "more or less exempt" (Stein 1977, Ecology 58:1237 [ABS]). Tethered crayfish of 15–18 mm carapace were taken more than 23–25 or 33–35 mm; *O. virilis* (Maine's commonest) more than *rusticus* or *propinquus* (DiDonato & Lodge 1993, CJFAS 50:1484 [ABS]). With bass present crayfish cut activity and moved to protective substrate (Stein & Magnuson 1976 [ABS]). All species sheltered in cobble by day and spread out at night (Hill & Lodge 1994 [ABS]). Only about half of crayfish production was accessible to fish (Rabeni 1992 [ABS]).
- **Handling:** a grass pickerel handled bluegill 40–80 % faster than a largemouth of the same 20-mm mouth width, and its optimal and maximum prey were 56 % and 46 % larger (Hoyle & Keast 1988, Can. J. Zool. 66:540 [ABS]).
- **Digestibility:** intermolt *O. propinquus* are 38–46 % ash and 14–16 % chitin by dry mass (recently molted 19 % and 9 %, but 84 % water) (Stein & Murphy 1976, JFRBC 33:2450 [ABS]). Wet energy densities: crayfish 3.8 kJ/g vs fish 4.2 kJ/g [SEC, attribution unverified].
- **Crayfish may be scarce in Hot Brook.** Crayfish nearly vanish below ~2 mg/L calcium in Ontario Shield lakes; juvenile *O. virilis* survival fell at 0.5–0.9 mg/L [SEC]. Maine was listed as crayfish-free in 1870 and some Maine lakes were stocked with crayfish in 1959 "to provide additional forage for the smallmouths" [SEC]. A tea-coloured, soft-water Maine lake may therefore hold far fewer crayfish than the Michigan values (5–20 g/m²) the sim uses.
- **Note on Wahl & Stein's bluegill value:** the sub-researcher read the abstract's OCR "0A4" as ~0.44; RTF read the full text as **0.14** (Moody et al. independently 0.13). Use 0.14.

---

## Implications for the simulation

### Diagnosis [derived]
1. **The fish-kill hazard is one to two orders of magnitude too low.** A pickerel with yellow perch at 0.05 m⁻³ (≈ 500 ha⁻¹ concentrated ~3× in the littoral) has 0.36 perch inside its 1.2-m sphere. With w ≈ 0.25 (mean 1 − d/R) × 0.6 × 0.6 × 0.9 (size) × 0.7 (cover) ≈ 0.057 per perch, the hazard is 2.3×10⁻⁴ × 0.057 × 0.36 ≈ **0.017 kills h⁻¹ (≈ 0.1–0.4 a day)**, and 0.003 h⁻¹ at 0.01 m⁻³. The mechanistic figure for a hungry esocid with perch in view is **0.4–1.7 kills h⁻¹** (§3).
2. **Encounter is not the limit; the strike rate and satiation are.** An ambusher with RD 1.0 m meets perch moving at 0.1 m/s at 0.05 m⁻³ at λ = π·RD²·u·N ≈ **57 h⁻¹** (11 h⁻¹ at 0.01 m⁻³; 340 h⁻¹ for YOY at 0.3 m⁻³). Real predators strike at only ~1–6 h⁻¹ (esocids) or ~30 h⁻¹ (bass, open water) even with prey always in view, and stop when full.
3. **The two foods are fed through different machinery.** Crayfish come as a continuous, satiating intake at the Cmax-limited "want" rate, ×5 preference, 30 % exposed by day; fish come as a rare Bernoulli event. Whatever the parameters, the continuous route fills the gut first except where crayfish are scarce. Real predators meet both through the same encounter–attack–capture sequence, and prefer fish.
4. **School exponents protect perch and white perch twice.** A super-individual school of n counts n^0.5 (n^0.65 for pickerel) toward the hazard, yet esocid capture is not reduced by schools (Turesson & Brönmark 2004). The dilution belongs in *per-capita* risk (one fish per strike), not in the predator's kill rate.

### (a) Encounter radius in coloured water, by light
- **RD_day:** pickerel **1.0–1.2 m** (use 1.1), smallmouth **0.8–1.0 m** (use 0.9), piscivorous yellow and white perch 0.3–0.5 m (prior; walleye 29 cm). Do not shrink pickerel success for colour beyond this RD: realised pike feeding was colour-insensitive (Nilsson-Örtman 2026).
- **Light:** RD(I) = RD_day · I/(I + K_I) at the fish's depth (I = sky × 0.9 × e^(−0.85 z)). K_I ≈ **1 lx** for pickerel (diurnal; plus a night activity multiplier ~0.1, from 2 % vs 17–22 % active), **0.8 lx** for a largemouth-type and **~0.01 lx** for smallmouth with a non-visual floor of 0.3–0.4 m (Michels). This replaces `max(0.3, visDay)` × `strikeR`.
- **Detection ≠ strike.** Keep `strikeR` as the *stalk/encounter* radius = RD(I) in the coarse model; the true strike distance (pickerel 0.14–0.37 BL, bass ~1–1.3 BL) only matters in fine mode.
- **Temperature:** multiply esocid strike rate by a cold factor falling from 1 at ≥ 12 °C to ~0.3 at 5 °C (Öhlund's threshold is for trout prey; for perch prey use a gentler ramp).

### (b) Capture success per strike, by prey type and size
CS = CS₀(prey) × size term × mode × school term, with PPR = prey TL / predator TL:

| Prey | CS₀ for esocids (ambush) | CS₀ for smallmouth | Basis |
|---|---|---|---|
| Killifish, dace, fallfish, small sucker (soft-rayed, fusiform) | **0.70** | 0.60 | fathead 0.67, shad 0.78, pickerel 23/30; Mauck & Coble "most vulnerable" |
| Yellow perch | **0.35** | 0.45 | between fathead and bluegill; Mauck & Coble "intermediate"; pikeperch 100 % on perch in clear water |
| White perch | **0.30** | 0.40 | deeper and spinier than yellow perch; *Morone* CS falls 1.4× faster with size than soft-rayed (Scharf) |
| Pumpkinseed, redbreast | **0.12** | 0.55 (small) | esocids 0.10–0.14; largemouth 0.57–0.83 on 12–16 %-length sunfish |
| Bullhead | 0.10 | 0.20 | Mauck & Coble "least vulnerable" |
| Crayfish (exposed) | 0.3–0.5 [prior] | 0.3–0.5 [prior] | not measured here; see the sub-researcher's crayfish notes |

- **Size term:** multiply by (1 − PPR/PPR₀) with PPR₀ ≈ 0.88 (soft-rayed) and ≈ 0.6 (*Morone*, perch, sunfish) — the Scharf slopes renormalised so the term is 1 at PPR → 0 — and keep the gape cut-off by body depth. (The sim's current 1 − (depth/gape)² is flatter at small sizes; either works if CS₀ is set from the table.)
- **Mode:** pursuit strikes × 0.33 (pike 0.12 vs 0.36).
- **Schools:** esocids × 1; bass × n^(−0.8) per encounter with a school of n (trials ending in capture 100 / 17 / 11 % at 1 / 8 / 15 prey); piscivorous perch × 0.15 into a school.
- **Cover and light do not change CS;** they change encounter (vegetation: encounters × 0.85 / 0.1 / ~0 at ~26 / 130 / 600 natural stems m⁻², RTF §9.3) and RD.

### (c) Attack rate in real time, consistent with field meals per day
Replace ATTACK·Σw with a saturating, satiation-gated strike process. Per predator, per second of the step while hunting:
- **Encounters** E = Σ_i π·RD(I)²·(u_i + v_pred)·N_i (prey per m³ of the prey class i in its cell or neighbourhood; u ≈ 0.05–0.15 m/s for perch-sized prey; v_pred 0 for pickerel, ~0.1–0.3 m/s for bass while searching).
- **Strike rate** S = A_max · E/(E + E_h), with **A_max = 3 h⁻¹ (8×10⁻⁴ s⁻¹) for pickerel** (esocids 1.4–5.8 h⁻¹) and **12 h⁻¹ (3×10⁻³ s⁻¹) for smallmouth** (largemouth 31 h⁻¹ open, 6–7 h⁻¹ in half cover; use the vegetation factor on top), and **E_h ≈ 30 encounters h⁻¹** (so strikes fall off only at prey densities ≲ 0.03 m⁻³).
- **Which prey:** prey i is struck with probability ∝ E_i × pref_i, pref = 1 for fish, **0.2–0.3 for crayfish** (Carter: avoided; McNeely: 1.7 % vs 35 %).
- **Kill** with CS_i from (b). A school loses one fish.
- **Gate:** hunt only while gut room ≥ the prey's mass and only for a hunger-weighted share of the step; f_active by time of day (pickerel ~0.2 at dawn/dusk, ~0.15 by day, ~0.02 at night; smallmouth ~0.3 by day). After a kill, pickerel rest until evacuation frees room (48 h per full meal in summer).
- **Check it reproduces the field:** with these values a hungry 40-cm pickerel among perch at 0.05 m⁻³ kills ≈ 3 h⁻¹ × 0.65 × 0.35 ≈ **0.7 perch h⁻¹**, so it fills its ~10 g/d in 1–2 h and is satiation-limited — the targets are **0.5–2 fish per day, 30–60 % empty stomachs, one prey per non-empty stomach** (pickerel) and 1–2 items (bass). At 0.01 m⁻³ (sparse adults) it still gets ≈ 0.25 h⁻¹, i.e. a fish in a dawn or dusk bout. In the step formula, P(kill in dt) = 1 − exp(−S·CS̄·f_active·dt).
- **Equivalent in the present formula** (if a minimal change is wanted): to reach ~0.5 kills h⁻¹ at 0.05 perch m⁻³, ATTACK must rise ~**30×** (to ~7×10⁻³ s⁻¹), and the hazard must then be capped by A_max·CS̄ so dense prey don't produce runaway kills. The saturating form above does both.

### (d) Prey size windows
- Preference (encounter weighting) peaks at **PPR 0.10–0.25**, capture falls linearly with PPR, and the hard limit is body depth ≈ gape (pickerel gapeR 0.13 TL; bass 0.115). The largest prey taken: PPR ≈ 0.35–0.45 for fusiform prey, ≈ 0.25–0.30 for deep-bodied sunfish and white perch.
- For the lakes' piscivores this targets **YOY (4–8 cm) and yearling (8–12 cm) yellow perch and white perch** as the bulk of fish eaten by 30–45-cm pickerel and bass; adults ≥ 15 cm mostly by pickerel > 45 cm.

### (e) Crayfish vs fish
- Feed crayfish through the same encounter–strike–capture route as fish (discrete ~12-g items), or at least make the crayfish food response satiate on **fish-first**: cut `LIT3.CR_PREF` from 5 to **≤ 1** (equal weight per gram) or 0.2–0.3 if crayfish are struck as items.
- Crayfish exposure by day: **10–20 % out** (they shelter by day and hide more with fish about) instead of 30 %; 50–70 % at night, when pickerel and bass hunt little. That alone moves most crayfish predation to dusk and to smallmouth.
- Charge crayfish their costs: longer handling (≈2× a fish of equal mass), ~2× slower evacuation, 3,500 J/g × 0.85 digestibility (intermolt adults are 38–46 % ash; 0.7–0.8 may be nearer).
- **Size refuge:** make crayfish CS fall with carapace length (small 15–18 mm CL most taken; ovigerous females and breeding males nearly exempt) so the adult stock is mostly out of reach, as Rabeni's "half of production accessible".
- **Check the stock itself:** if Hot Brook's calcium is ≲ 2–4 mg/L (soft, coloured Maine water), the crayfish carrying capacity (`CR_ROCK` 25, `CR_WEED` 15 g/m², from Michigan) is probably several-fold too high. Look up the lakes' Ca and conductivity (Maine DEP/PEARL) before tuning anything else on the crayfish side.
- Expected outcome to check (≥ 3 seeds): summer pickerel diet ≥ 80–95 % fish by mass (white perch and yellow perch the top two in Maine); smallmouth 35–55 % crayfish and 35–50 % fish in a weedy perch lake, crayfish peaking July–September (PDPM §2); perch and white perch age-1–2 losses to fish predation ~15–35 % a year (PDPM).

---

## Gaps
- No direct chain-pickerel RD, capture-per-strike on yellow or white perch, or field strike rate exists in what was read; all are esocid surrogates.
- No esocid or bass capture-success measurement on white perch.
- Lab functional-response constants for esocids are unusable in absolute terms (prey depletion; arena effects).
- The crayfish CS values in (b) are priors; Stein 1977 (smallmouth on crayfish by size and sex) and Probst et al. 1984 were not read in this pass.

## To fetch (blocked or unread; not bypassed)
- Ranåker et al. 2012, *Freshw. Biol.* 57:1761 — pike RD in cm by visual range and water type: [doi:10.1111/j.1365-2427.2012.02836.x](https://doi.org/10.1111/j.1365-2427.2012.02836.x); Ranåker thesis PDF [portal.research.lu.se/files/5524614/2520970.pdf](https://portal.research.lu.se/files/5524614/2520970.pdf) (HTTP 403).
- Jönsson 2012 thesis PDF (pike encounter, capture success by water type): [portal.research.lu.se/files/5530558/2536529.pdf](https://portal.research.lu.se/files/5530558/2536529.pdf) (403); Jönsson et al. 2013, CJFAS 70:1685, [doi:10.1139/cjfas-2013-0150](https://doi.org/10.1139/cjfas-2013-0150).
- Turesson & Brönmark 2007, Oecologia 153:281 (field encounter rates per hour vs Secchi): [doi:10.1007/s00442-007-0728-9](https://doi.org/10.1007/s00442-007-0728-9) (Springer login redirect).
- Öhlund et al. 2015, Proc. R. Soc. B 282:20142254 — field attack-rate units and values: [PMC4286053](https://pmc.ncbi.nlm.nih.gov/articles/PMC4286053) (bot-check page; publisher 403).
- Vogel & Beauchamp 1999, CJFAS 56:1293 (lake trout RD vs light, turbidity, prey size) — cdnsciencepub 403.
- Sweka & Hartman 2003, Environ. Biol. Fish. 67:341, [doi:10.1023/A:1025835031366](https://doi.org/10.1023/A:1025835031366); Sweka 1999 MS thesis PDF [researchrepository.wvu.edu](https://researchrepository.wvu.edu/cgi/viewcontent.cgi?article=2017&context=etd) (403).
- Eklöv & Hamrin 1989, Oikos 56:149 (pike on perch vs rudd; JSTOR page did not load); Christensen 1996, Oikos 76:368; Christensen & Persson 1993, Behav. Ecol. Sociobiol. 32:1; Nursall 1973, JFRBC 30:1161 ([doi:10.1139/f73-187](https://doi.org/10.1139/f73-187)) — abstracts empty in OpenAlex.
- McMahon & Holanov 1995 full text (light thresholds by depth and clarity): [doi:10.1111/j.1095-8649.1995.tb01599.x](https://doi.org/10.1111/j.1095-8649.1995.tb01599.x); the Montana State PDF host did not resolve.
- Snow et al. 2018 (tiger musky, turbidity) and Shoup & Lane 2015 PDFs on the OSU Shoup-lab site (403); Moody et al. 1983 and Tomcko et al. 1984 on kb.osu.edu (403 this session — RTF read Moody in full earlier).
- Michigan DNR RR 1923 (scanned, no text layer).
- Cooper 1941, Maine Dept. Inland Fish. Game Fish. Surv. Rep. 4 (original pickerel and smallmouth stomach data).
- Gosch & Pope 2011 full text (white perch consumption rates by predator): [doi:10.1051/kmae/2011028](https://doi.org/10.1051/kmae/2011028).
- From the crayfish sub-researcher: **Watson 1965, "The Maine Smallmouth"**, Maine IFW Fish. Res. Bull. 3 ([digitalmaine](https://digitalmaine.com/ifw_docs/217); PDF 403) — probably the best Maine smallmouth diet source; **Warner 1973**, TAFS 102:149–151 (spring food of chain pickerel in Maine lakes); the MDIFW pickerel plan and the Hot Brook lake survey sheets (maine.gov 403); Weidel et al. 2000 diet table (MSU PDF fetched empty); Liao et al. 2002 (Iowa State copy 403); Foote & Blake 1945 (J. Wildl. Manage. 9:89); Underhill 1949; Keast 1985 (EBF 12:119); Clady 1974; Stein 1977 full text; Roell & Orth 1993 full text (crayfish energy density); Crane & Einhouse 2016 (JGLR 42:405); Mather & Stein 1993 (kb.osu.edu 403). Crossman & Lewis 1973 (archive.org, open) indexes further pickerel diet studies.

---

## Addendum: prey-size and diel-timing sub-researcher (report arrived after hand-in)

Tags as the sub-researcher gave them. Only additions to §4–§5 are listed.

**Prey size**
- **Chain pickerel gape rule** — Lawrence 1960, Proc. SE Assoc. Game Fish Comm. 14:257–258, [PDF](https://seafwa.org/sites/default/files/journal-articles/LAWRENCE-257.pdf) [FT]: a pickerel swallows any fish whose body depth ≤ its own (belly not distended); no rigid cleithral ring. Pickerel depth D (mm) vs TL L: 100–199 mm D = 1.95 + 0.110L; 200–299: −3.19 + 0.134L; 300–399: −18.59 + 0.182L; 400–499: −22.08 + 0.193L; 500–599: −29.47 + 0.203L; 600–699: −77.53 + 0.264L. Largest prey: at 12.5 in, bluegill 35 %, golden shiner 54 %, shad 47 % of pickerel TL; at 16.5 in, 38 % / 59 %; at 20.5 in, 39 % / 61 %. Perch-shaped prey, interpolated: max ≈ 40–55 % of TL. (Compare the sim's pickerel `gapeR` 0.13·TL against D ≈ 0.13–0.15·TL at 30–40 cm: consistent if the size rule uses prey body depth vs this depth.)
- **Guillory 1980**, Proc. SE Assoc. Fish Wildl. Agencies 33:507–517, Lake Conway FL, n = 521 [FT]: fish dominate from 135–150 mm SL; > 300 mm almost exclusively piscivorous; empty stomachs rise with size; ~1 fish per stomach; pickerel > 300 mm selected *Lepomis*, bullhead and chubsucker; diet tracked prey abundance only below 200 mm (r = +0.50 vs −0.04 above 300 mm).
- **Buntz 1966** [FT]: mean prey 5.9 in ≈ 30 % of pickerel TL (modes 4 and 7 in); 15–23-in pickerel took 2–5-in prey (9–33 %); largest 50 % (golden shiner) and 43 % (bluegill). Night electrofishing caught 30 % of pickerel vs 10 % by day.
- **Persson, Bertolo & De Roos 2006**, J. Fish Biol. 69:461 [FT]: pike prey:predator length window 0.03–0.55 (Eurasian perch 0.05–0.45).
- **Gaeta et al. 2018** smallmouth quantile fits (prey TL = exp(α + β·TL²), mm): median α 3.83, β 1.82×10⁻⁶; 99th α 4.64, β 2.48×10⁻⁶ → 200/300/400-mm bass median 50/54/62 mm (25/18/15 %), 99th 114/129/154 mm (57/43/38 %) [FT, sub-researcher's calc]. Fusiform prey IPmax 33–49 %, compressed 4–39 %.
- **Smallmouth gape** (Fernando, Hecke & Eggleton 2018, Southeast. Nat. 17:309 [FT]): horizontal gape = −1.828 + 0.120·TL mm; pumpkinseed depth = −5.357 + 0.421·TL → a 300-mm bass fits pumpkinseed ≤ ~94 mm (31 %).
- **Zimmerman 1999**, TAFS 128:1036 [FT]: smallmouth mean maximum prey 40–51 % of length by prey type; crayfish 48 % of diet in Columbia reservoirs; 32 % of daily ration taken 03:00–12:00.
- **Which perch:** Savanne Lake ON pike and walleye ate mainly juvenile yellow perch of 60–110 mm (Mosindy 1980 [ABS]); age-0 perch 0–42 % of smallmouth diet by weight, smallmouth removing 1–34 % of age-0 perch production (Dembkowski et al. 2015 [ABS]); in Oneida Lake age-0 perch are eaten offshore in early summer, then nearshore in fall and their second year by walleye and bass (Fetzer 2013 [ABS]); yellow perch were 36–68 % of all prey eaten by Spirit Lake's predators (Liao et al. 2004 [ABS]).

**Timing and place**
- **Yellow perch at dusk** (Helfman 1979, JFRBC 36:173 [ABS]): a fixed light-cued sequence — last feeding, school breakup, rest on the bottom — reversed at dawn at lower light. Summer schools dense (< 0.5–0.6 m spacing) and ~6.7 m tall; school size rises with light (r = 0.77) (Hergenrader & Hasler 1968 [ABS]). Predators are more active at twilight (Helfman 1981 [ABS]). Offshore species move into the shallows at night (Emery 1973 [ABS]).
- **Twilight advantage:** minnows detected a stalking pike model at only ~⅓ of the daylight distance in dawn light (Pitcher & Turner 1986, J. Fish Biol. 29A:59 [ABS]).
- **Pike activity:** active 37 % of the time with dawn and dusk peaks in summer, along vegetated shoreline (Cook & Bergersen 1988, TAFS 117:495 [ABS]); crepuscular in summer, diurnal in winter (Reebs 2002 [FT]).
- **Smallmouth:** crepuscular in the lab (Reynolds & Casterlin 1976 [ABS]); Lake Opeongo summer depth 2–4 m, < 2 m at night, 3–5 m by day (Suski & Ridgway 2009 [FT]).
- **White perch:** loose open-water schools deeper than yellow perch, not cover-oriented, moving inshore or up at night [SEC, popular guide]; no primary lake study found.
- **Chain pickerel:** no primary diel or telemetry study; dawn and dusk feeding per agency fact sheets [SEC].

**Where this report differs from the note's reading.** The sub-researcher concludes that crayfish-heavy diets are realistic and that the perch shortfall is about size reach, place and time. That holds for clear, rocky, crayfish-rich water (§6). For Hot Brook, Maine pickerel diets are ~95 % fish (Cooper 1941), and crayfish are likely scarce in soft, coloured water. So the implications above stand: put fish and crayfish through the same encounter–strike route, and add the **dusk window**. Perch schools break up in the shallows at dusk, and their detection range falls about 3× faster than a stalking predator's. That window is where most perch kills should come from.

**Further sources to fetch (this sub-researcher):** Cooper 1941 at [digitalmaine](https://digitalmaine.com/cgi/viewcontent.cgi?article=1071&context=ifw_docs) (168 MB, not downloaded); Warner 1973; Mittelbach & Persson 1998 regressions; Helfman 1979/1981, Emery 1973, Keast & Welsh 1968, Cook & Bergersen 1988 and Diana 1980 full texts; Hambright 1991 and Hambright et al. 1991 (body-depth regressions); Einfalt & Wahl 1997 (yellow perch depth vs length); Pierce et al. 2001 (NAJFM 21:884); Kobler et al. 2008 (bot-check page, not bypassed); Liao 2002/2004 full texts; Fetzer 2013.

---

## Addendum 2: functional-response and ration sub-researcher (report arrived after hand-in)

Additions to §3 only; tags as reported.

- **No usable esocid type II constants exist in the main compilation.** FoRAGE V5 (Uiterwaal et al. 2022, Ecology; data doi:10.5063/F1RX99KB) has **no *Esox* entries**. Its only *Micropterus*-on-fish rows are three South African invasion studies [FT scan]. In FoRAGE, a is in m² (or m³) per predator per day and h in days.
  - Largemouth 1.7–11.4 g on tilapia of 18–75 mg (Cuthbert et al. 2020): a = 0.30–2.14 m³/d, h ≈ 0–0.011 d.
  - Largemouth 7.8 g on guppies (Alexander et al. 2015): a = 1.95–7.31 m³/d, h = 18–30 min.
  - The same bass on 2-g tadpoles (Alexander et al. 2014): a = 0.49 m³/d, h = 50 min.
  - Bluefish (Buckel & Stoner 2000): a = 26–56 m³/d.
  - **These h values would allow ~50–80 prey a day, far above Cmax.** Short-trial handling time is not the daily limit; digestion is (as RTF §5.6 and this note's §3 say).
- **Turesson & Brönmark 2004 details** [FT]: 2.44-m pools 0.35 m deep (~1.6 m³), roach at 0.30 of pike length, 19.7 °C, trials up to 1 h.
  - 166 attacks, 25 captures (0.151). Sit-and-wait strikes: 8/22 (0.36). Pursuit strikes: 17/144 (0.12). Only 13 % of attacks were sit-and-wait.
  - Pike ate in 25 of 35 trials. Time to first move: median 112 s, mean 480 s, shorter at higher prey density.
  - **In a small pool, pike mostly chased.** In the lake, ambush from cover should dominate, so CS ≈ 0.3–0.36 against fish of about 0.3 of pike length.
- **Nilsson-Örtman 2026 model functions** [FT]:
  - roach cruise speed = 0.1·e^(0.15T) m/s;
  - pike attack speed = 0.2 + 3.2/(1 + e^((5 − T)/1.2)) m/s;
  - capture success = 1/(1 + e^(−2·v_diff)).
  - Useful as a temperature form for the cold ramp in (a).
- **Gillen, Stein & Carline 1981** [ABS]: tiger muskellunge chose cyprinids at ~40 % and bluegill at ~30 % of their own length, as predicted by handling time per dry weight.
- **Empty stomachs, a broader base:**
  - largemouth 38–54 %, pike 34.7–66.7 % (Soupir et al. 2000);
  - Oklahoma largemouth 55 % (pooled 56.5 %, n = 1,875), stomachs typically holding one prey, morning 75 % vs afternoon 56 % empty (Zweiacker & Summerfelt 1974 [FT]);
  - diurnal piscivores 35.2 ± 3.5 % empty against 16.2 % for all fishes (Arrington et al. 2002, Ecology 83:2145 [FT]).
- **Smallmouth ration:** 28.7 mg/g/day (2.9 %BW/d) mean, April–August, Columbia River (Vigg et al. 1991, TAFS 120:421 [ABS]).
- **Whole-lake consumption** (Mille Lacs bioenergetics, MN DNR IR 576 [FT]): about 2.1–2.3 kg of prey per pike per year and about 0.87 kg per smallmouth per year.
- **Gastric evacuation** (He & Wurtsbaugh 1993, TAFS 122:717 [ABS]):
  - pooled over 22 species, rate h⁻¹ = 0.049·e^(0.072T) − 0.060·ln(prey g);
  - for a 5-g prey, ≈ 21 h to 90 % empty at 20 °C and ≈ 13 h at 24 °C [sub-researcher's calc];
  - smallmouth clear 90 % of a meal in 4–95 h, faster in warm water and in larger fish, slower for bigger meals (Rogers & Burley 1991, CJFAS 48:933 [ABS]).
- **No published lake p-values** were found for pike, pickerel or smallmouth. The esocid bioenergetics model overestimated field consumption by 32–59 % (Wahl & Stein 1991 [SEC]).
- **Pike movement** (Margenau 1986, WDNR Rep. 139 [FT]):
  - 0.70 m/min by day vs 0.06 m/min at night, i.e. ~2 min of swimming per daylight hour;
  - home areas < 4.5 ha in weed beds 1.5–3 m deep.
  - Pike also stay within 300 m of shore in < 4 m of water (Diana et al. 1977 [ABS]).

**Effect on the implications.** These support (c) as written:
- Field intake is digestion-limited, with 35–60 % of stomachs empty and one prey per full stomach.
- Lab a and h cannot be used directly.
- A strike-rate cap plus gut gating, with He & Wurtsbaugh evacuation, is the defensible structure.
- Use the pooled evacuation formula for pickerel and bass in place of fixed times, keeping pike's 48 h (summer) and 12 days (winter) as checks.

**To fetch (this sub-researcher):**
- Diana 1979 and 1980 (cdnsciencepub 403);
- Nilsson-Örtman 2026 Fig. 3 and Appendices S1–S5, and the Dryad data (doi:10.5061/dryad.kkwh70sjc; API 401);
- Hart & Connellan 1984 (pike handling time vs prey weight);
- Hart & Hamrin 1988; Heikinheimo 1996 (pike p-values);
- Bevelhimer et al. 1985; Hambright 1991; Hodgson & Kitchell 1987;
- He & Wurtsbaugh 1993 full text (USU PDF 403); Vigg et al. 1991 tables;
- Breeggemann et al. 2016; Walrath et al. 2015;
- Kobler et al. 2008 (bot-check page, not bypassed).
