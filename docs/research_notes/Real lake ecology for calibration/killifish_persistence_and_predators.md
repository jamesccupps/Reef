# Banded killifish: how they persist with pickerel, bass, perch, white perch and fallfish (Hot Brook check)

Compiled 2026-10-20 for the 3-D sim of Upper and Lower Hot Brook Lake, Maine: shallow (mean 2.4–3.3 m), unstratified, tea-coloured, Secchi ~3–4 m. MDIFW has listed banded killifish there since 1949 and again in 2024, alongside chain pickerel, smallmouth bass, white perch, yellow perch, fallfish, bullhead, sucker, pumpkinseed and dace.

**STATUS: PROVISIONAL.**
- This note is built from evidence **already in the repo**, re-read and combined for this question, plus a reading of the sim's code (`src/w3/fish3.js`, `src/w3/species3.js`).
- Three literature sub-searches were launched and **had not reported back when the note was handed off**:
  - killifish population dynamics;
  - predator diets and declines under introduced predators;
  - fallfish, perch and white perch piscivory.
- **No new primary source has been added yet.** Every number below is either cited through the existing note that holds it (with that note's tag) or derived here [inf].
- The new sources that would most change the numbers are listed under **Gaps**.

**The sim problem.**
- ~148,000 killifish (233/ha) are founded. They hold < 0.3 m of water 60 % of the day, yet are eaten out within a year.
- The latest run's kills: **fallfish 51k**, chain pickerel 45k, white perch 18k. Most kills fall at the edge of the strip (0.3–0.6 m of water).
- **0 %** of their young reach their first spring.
- The sim's killifish: mature at age 1 (≥ 4 cm), spawn at 19–23 °C, M 1.35/yr, schools of 30–40, capture success against them 0.5–0.7.

**Tags.**
- [FT] full text read (by this or an earlier repo note);
- [ABS] abstract or record only;
- [SEC] secondary source or search snippet;
- [inf] my arithmetic or inference.
- Cross-references (the note that holds each item):
  - PDPM = `../Whole lake 3D fish simulation/predator_diets_and_prey_mortality.md`;
  - HNS = `../Whole lake 3D fish simulation/habitat3d_new_species.md`;
  - SFN = `../Hot Brook populations and water/small_fish_numbers.md`;
  - FNS = `../Hot Brook populations and water/fish_numbers_and_new_species.md`;
  - FSD = `../fetched_sources_digest.md` (Cooper 1941);
  - FSB = `../Whole lake 3D fish simulation/fallfish_spawning_brook.md`;
  - JRB = `juvenile_refuges_and_bass_young.md`;
  - FWM = `first_winter_mortality.md`.

---

## Takeaway

1. **The adults' mortality is not itself the problem.**
   - Banded killifish live 3–4 years at most, and a field age structure implies **total Z ≈ 1.0–1.5/yr for adults, rising steeply after age 2** [inf, from Phillips 2007].
   - Losing two-thirds of adults a year is normal. The sim's M 1.35 is in range.
   - The population survives only by recruiting every year: **~700 eggs per female per season in ~3 clutches** (Lake Erie; older counts 250–450).
   - Replacement needs **only ~0.2–0.3 % egg-to-age-1 survival** [inf]. The sim's 0 % first-spring survival is therefore the decisive failure.
2. **No study the repo holds names killifish as an important prey of any of the five predators.**
   - Cooper's 1941 Maine summer stomachs hold no killifish, although killifish were in his seine hauls (65 fish). The stomachs: pickerel 51 with food, smallmouth 36, yellow perch 160, white perch 1,252.
   - Smallmouth and northeastern pickerel have no killifish record at all.
   - The one direct predation study pairs white perch with killifish in experiments (Morgan & Godin 1985 [SEC]).
3. **Fallfish as the top killifish predator is the clearest error.**
   - Adult fallfish are drift and insect feeders: terrestrial insects lead (30 %), plus algae and aquatic insects.
   - Fish are a large share **only during pulses of naive fry** (Salmon River Chinook fry: 48–63 % of the diet in May).
   - Otherwise fish are probably ≤ 10–20 % of adult diet mass (FSB [inf]).
   - In the code, every fallfish **≥ 10 cm** strikes at the perch-like rate. Fallfish are 3.4× as numerous as pickerel, and a 10–20-cm fallfish can work water down to 0.1–0.2 m.
4. **Persistence in the field comes from:**
   - very shallow water (CT DEEP: "often in water under 6 in" [SEC]);
   - Maine's "extensive wave-swept shallows" (Cooper 1941 [FT via FSD]);
   - vegetation, schools, and a moving retreat to shallower water when a bass is near (Dunlop 1987 via Gabora & Colgan 1990 [FT]);
   - and numbers renewed each summer.
   - Where pickerel were introduced into small, naive Nova Scotia lakes, small fish vanished (Mitchell, LeBlanc & Heggelin [FT via PDPM]).
   - Hot Brook's killifish, by contrast, have coexisted with pickerel from at least 1949 to 2024.

---

## Q1. Killifish population dynamics

### Cited findings (all already in the repo)
- **Longevity:**
  - maximum age 4 in Newfoundland; "few live as long as 3 years" in Minnesota; generation time 1–2 years — COSEWIC 2014 [FT via PDPM §5.2];
  - eastern subspecies to ~110 mm, the largest NL fish 128 mm — COSEWIC [FT via FNS].
- **Age structure (Presque Isle Bay, Lake Erie, beach seine, 2003–04)** — Phillips, Ewert & Speares 2007, *Northeast. Nat.* 14 [FT via FNS]:
  - summer: age 1 **57 %**, age 2 **39 %**, age 3 **4 %**;
  - fall: 0+ **36 %** (32 mm), 1+ **48 %** (52 mm), 2+ **17 %** (63 mm).
  - Length at age, summer: **67, 79, 93 mm** at ages 1–3.
- **Maturity and fecundity** (Phillips 2007 [FT via FNS]):
  - mature at age 1; gravid females 64–96 mm (Quebec 42 mm).
  - Total eggs **694 ± 39**: 526 at age 1, 744 at age 2, 1,062 at age 3. Of these, 201 ± 16 are yolked at a time, so about **3 clutches** per season.
  - ln eggs = −6.00 + 2.85 ln L(mm).
  - Older maxima are lower: 250 (Carlander 1969) and 450 (NL), with eggs of 2.0–2.2 mm — COSEWIC [FT via FNS].
- **Spawning and hatching:**
  - 19–23 °C, late June–mid-August, most often on *Potamogeton* (NL); about 21 °C or higher on the mainland; Lake Erie GSI peak July 9–29 (COSEWIC; Phillips) [FT via HNS];
  - eggs hatch in **11–12 days at 22–27 °C** (NL government [SEC via HNS]);
  - warmer water gave higher hatch success, and cool NL summers may cause "complete cohort failures" (Penney, Litt & Purchase 2019, *J. Freshw. Ecol.* [ABS via HNS; DOAJ 403]).
- **Young of the year:**
  - grow linearly to **49.5 mm by mid-October**, then stop until spring (Lake Opinicon; Keast & Eadie 1984 via COSEWIC [FT via HNS]);
  - Lake Erie fall 0+: 32 mm (Phillips).
- **Numbers:**
  - Indian Bay, NL: Schnabel estimate **20,569 (95 % CI 12,529–40,201)** in August against 1,209 in July. The difference is mostly catchability below ~12 °C.
  - Fyke nets caught 23–42 fish a set; schools of 25–40 (Chippett 2004 via COSEWIC [FT via SFN]).
  - Killifish were 74–93 % of seine catches at ≤ 1.2 m (Phillips [FT via SFN]).
  - No density per m² exists (SFN).
- **First winter:**
  - no species data. The repo's generic rule for small cyprinids and killifish puts the threshold near their own autumn size (~50 mm) and the loss at **~30–40 % at the mean size** (FWM, "very low" confidence).
  - Killifish are inactive and uncatchable below ~12 °C, and probably move deeper in autumn (COSEWIC [FT via HNS]).

### Derived [inf]
- **Survival by age from Phillips' age structure** (assumes steady recruitment and equal catchability; seines under-sample large fish):
  - summer, age 1 → 2: 39/57 ≈ **0.68**; age 2 → 3: 4/39 ≈ **0.10**;
  - fall, 1+ → 2+: 17/48 ≈ **0.35**.
  - So **A ≈ 0.3–0.65 from age 1 to 2, and ~0.9 from age 2 to 3**: post-spawning senescence.
  - The adults' mean Z is ≈ 1.0–1.5, consistent with the Hoenig, Then and Lorenzen values in PDPM §5.2 (A 66–90 %).
  - **The sim's M 1.35 is in range, but its mortality should rise with age** (low at age 1, high after the second spawning season).
- **Replacement:**
  - Mean eggs over a female's life ≈ 600 × (1 + 0.5 + 0.05) ≈ 930.
  - With a 1:1 sex ratio, a pair needs 2 recruits, so **egg-to-age-1 survival ≥ 2/930 ≈ 0.2 %**.
  - A growing or resilient population needs ~0.5–2 %. That is in the range of the perch figure of 0.4–1.6 % from 18 mm to age 2 (FNS).
  - **The sim's 0 % is far below any field possibility.**

---

## Q2. Who eats killifish, and what lets them persist

### Cited findings (all already in the repo)
- **Predators named for killifish:**
  - NL: brook trout, Atlantic salmon, American eel, brown and rainbow trout, belted kingfisher, common merganser (DFO 2011 NL management plan [FT via HNS]);
  - COSEWIC adds salmonids, eel, kingfisher and merganser [FT via PDPM].
- **Kingfishers, Maritimes:** in warmer streams they ate suckers, sticklebacks, lake chub and banded killifish (White 1953 via Prose 1985 [FT via `../Maine lake shores and catchment/shore_birds_and_mammals.md`]). No percentage is given.
- **White perch:** in experiments, killifish in larger groups and in the core were less likely to be eaten, and no confusion effect was detected (Morgan & Godin 1985 [SEC via PDPM §4.3]).
- **Maine summer diets (Cooper 1941** [FT via FSD]; no killifish named in any):
  - pickerel 32–64 cm: ≈ 95 % fish. White perch 54.7 % of volume, golden shiner 14.0 %, yellow perch 7.5 %, pickerel 6.2 %, bullhead 4.5 %, smelt 3.0 %.
  - smallmouth 22–54 cm: 80 % fish. White perch 61 %, yellow perch 14 %, crayfish 14 %.
  - yellow perch 16–35 cm: fish ≈ 46 %.
  - white perch ≥ 15 cm: fish 26 %.
  - Cooper's seines took 65 banded killifish among ~4,500 seined fish.
- **Smallmouth:** "no record" of eating killifish (PDPM §2.2).
- **Pickerel:** no northeastern record of eating killifish. In Florida, small pickerel (< 300 mm SL) selected *Fundulus* congeners and larger pickerel avoided them (Guillory 1979 [FT via PDPM]).
- **Decline under introduced predators:**
  - 15 small Nova Scotia lakes (mean 15.8 ha, mean depth 2.7 m). Killifish were caught in 3 lakes without pickerel (1, 14 and 7 fish). The 3 lakes with pickerel introduced in about 1998–2007 held only pickerel and large white suckers; catch rate 0.047 vs 1.04 fish per trap-hour (Mitchell, LeBlanc & Heggelin [FT via PDPM §5.2]).
  - Caveats: naive communities, one night per lake, and killifish are poorly sampled by gill nets.
  - Small Ontario lakes with bass held 2.3 fewer small species (MacRae & Jackson 2001 [FT via PDPM]; no killifish in that study).
  - Removing > 90 % of an Adirondack lake's smallmouth raised six littoral species 4–90× (Weidel et al. 2007 [SEC via PDPM]).
- **Coexistence:**
  - killifish are in 26 % and pickerel in 45 % of northeastern US lakes (Whittier et al. [ABS via PDPM]);
  - Maine's eastern pickerel were transplanted in the 1800s, so Hot Brook's killifish have lived with them for ≥ 75 years on the record (PDPM).
- **Refuge habitat:**
  - "often in water under 6 in", over sand near vegetation (CT DEEP [SEC via `../Hot Brook populations and water/eastern_maine_relative_abundance.md`]);
  - in Maine, "typically a lake fish… on extensive lake shallows", in "large lakes with extensive wave-swept shallows" (Cooper 1941 [FT via FSD]);
  - plant beds with > 20 % biovolume and *Chara* (Valley et al. 2010 [ABS via HNS]);
  - with a largemouth present, Opinicon fish kept farther from it and moved to shallower water (Dunlop 1987 via Gabora & Colgan 1990 [FT via HNS]).
- **The conflict (not resolved).** Helfman 1981 (via McInerny & Cross [SEC via JRB]) puts Lake Opinicon killifish schools in **1–1.6 m by day, dispersing into < 0.6 m at night**. The CT DEEP and seine evidence puts them in < 0.15–1.2 m by day.

### Derived [inf]
- The repo's evidence implies that in coexisting lakes **killifish are a minor, opportunistic prey**:
  - absent from Maine's adult-piscivore stomachs in summer;
  - plausible in small pickerel (< 30 cm), kingfishers, mergansers and herons that work the very shallow edge.
  - Whole-lake losses to fish predators are therefore probably a modest share of their high total mortality, not most of it.

---

## Q3. Fallfish diets (lakes vs streams)

### Cited findings (all already in the repo)
- **Adult diet:**
  - "opportunistic feeders" on aquatic insect larvae, terrestrial insects, crustaceans and fish (Kingsbury 1977); "algae is also an important constituent" (Reed 1971, Massachusetts) — both via Trial et al. 1983 [FT via FSB];
  - Massachusetts: an omnivore eating "algae, fish, aquatic and terrestrial insects, and crayfish" (Reed 1971, *TAFS* 100:717 [ABS via FSB]).
- **Summer, Salmon River NY:** terrestrial invertebrates were the main food at **30.0 %**, with a single evening feeding peak (Johnson 2015, *Am. Midl. Nat.* 173:326 [ABS via FSB]).
- **Jacques-Cartier River, Quebec:** mainly aquatic insects; the fallfish isotopic niche lay inside the brook trout's (Lambert, Cabana & Enders 2026, *Env. Biol. Fish.* [ABS via FSB]).
- **Piscivory in a fry pulse (Salmon River, May 2009):**
  - Chinook fry were **62.5 %** of the diet of fallfish ≥ 150 mm and **48.1 %** of fallfish 100–149 mm;
  - **fallfish < 100 mm ate none** (Johnson et al., AFS 2010 [SEC via FSB]).
  - Fallfish ate ~2.9 million Chinook parr of mean 44.5 mm (Johnson et al. 2016, *NAJFM* 36:74 [ABS via FSB]).
  - Prey:predator length ≈ 0.3–0.45 [inf via FSB].
- **Maine lakes (Cooper 1941** [FT via FSD]):
  - fallfish were the second-commonest minnow: 344 in seines and 7 in gill nets, the netted fish 1–2 lb;
  - fallfish were themselves 0.9 % of white perch food.
  - No fallfish stomachs were reported.
- **No lake diet of adult fallfish with numbers is in the repo.**

### Derived [inf]
- Fallfish turn partly piscivorous from ~10 cm. Without a pulse of naive fry, fish are probably **≤ 10–20 % of adult diet mass** (FSB).
- Their foods are drift and surface insects at an evening peak, which overlaps little with killifish holding < 0.3 m over plants.

---

## Q4. Adult white perch and yellow perch as predators of small littoral fish

### Cited findings (all already in the repo)
- **White perch ≥ 15 cm, Maine (Cooper 1941; n = 1,252; summer 1940** [FT via FSD]):
  - by volume: **mayfly nymphs 44 %** (aquatic insects 60 %); **fish 26 %** (yellow perch 10.1 %, smelt 9.1 %, white perch 3.8 %, fallfish 0.9 %); crustaceans 12 %.
  - Over 20 lakes: bottom fauna 67 %, fish 26 %, plankton 6 %.
  - Fast-growing perch had "from 20 to 50 per cent fish".
  - No killifish named.
- **Yellow perch 16–35 cm, Maine (Cooper 1941; 160 with food** [FT via FSD]): fish ≈ **46 %** (white perch ~17, yellow perch ~11, one redbreast ~10, smelt ~2); mayflies 22 %, dragonflies 18 %.
- **MDIFW:** "large perch will eat most small fish including their own species" (white perch plan [SEC via `../Maine lakes ponds and streams/sucker_shiner_bullhead_trout_parameters.md`]).
- **Where white perch feed:** schools sit offshore over fine sediment by day and come onto the 0.9–1.5-m flats at night (sim habitat per `../Seasonal fish habitat use/` notes). One study found young fish "came into the shallows at dusk to feed on the bed" (FSR via repo).

### Derived [inf]
- In Maine, both perches' fish prey are mostly pelagic or offshore fish (perch, white perch, smelt), not shore-edge minnows.
- White perch reach killifish water mainly at night, when killifish are dispersed and visual strikes are weak.

---

## Gaps (sources the launched sub-searches were to read; not yet in hand)
- **Fritz & Garside 1975**, *Can. J. Zool.* 53:361–369: age, growth and fecundity of *F. diaphanus* in Nova Scotia. This is the best source for northern survival by age and clutches.
- **Chippett 2004** (MUN thesis, > 10 MB) and **Penney et al. 2019** (hatch success by temperature; DOAJ 403).
- **Keast 1985**, *Env. Biol. Fish.* 12:119: Lake Opinicon piscivore guild. It should give killifish shares in the diets of largemouth, pike, yellow perch and rock bass.
- **Morgan & Godin 1985; Godin & Morgan 1985:** white perch attack and capture rates on killifish schools.
- **Helfman 1981**, *CJFAS* 38:1405: the killifish's day depth. It would settle the day/night band conflict.
- **Reed 1971** full text, plus Scott & Crossman 1973, Smith 1985 and Fuller & Cooper 1946: fallfish lake diets with numbers.
- **LeBlanc 2010; Whittier & Kincaid 1999; Findlay et al. 2000; Chapleau et al. 1997;** Miramichi Lake (NB) smallmouth reports; Kejimkujik studies: killifish decline rates under introduced bass and pickerel.
- **Bird diets with killifish shares:** loon, mergansers, kingfisher (White 1953 original), heron.
- No banded killifish density per m², first-winter survival, or recruitment-variability series has been found anywhere so far.

---

## Implications for the sim

### 1. Killifish annual mortality and its split [inf; targets]
- **Total, adults:** Z ≈ 1.0–1.5/yr (A 63–78 %).
  - Keep M ≈ 1.35, but let it **rise with age**: ~0.4–0.8 at age 1→2 and ~2 at age 2→3 (from Phillips' age structure).
  - Equivalently, add a post-spawning senescence term in the second spawning season.
- **Predation's share of adult deaths: ≈ 40–60 %**, i.e. Z_pred ≈ 0.4–0.8/yr.
  - On ~148,000 founders that is **~50,000–80,000 adults eaten in the first year**, spread through the season.
  - The sim's 114,000+ from three predators, with most in the first fortnight, is far too many and far too fast.
- **Split of fish-predation deaths (provisional targets):**

  | Predator | Share of killifish eaten | Basis |
  |---|---|---|
  | Chain pickerel (mostly < 30 cm) | 35–50 % | Florida: small pickerel select *Fundulus*; Hot Brook has no golden shiner, which fills the soft-rayed slot in Maine diets (14 % of pickerel food) |
  | Smallmouth (young and small adults) | 10–20 % | no killifish record; Tester and Maine minnow mentions |
  | Yellow perch | 10–20 % | fish 46 % of diet, mostly perch and white perch |
  | White perch | 5–15 % | fish 26 %, offshore prey; night-only overlap |
  | **Fallfish** | **≤ 5–10 %** | drift and insect feeder; fish significant only in fry pulses |
  | Birds (kingfisher, merganser, heron, loon) | +0.1–0.3 Z on top | named predators; no numbers |

### 2. Fecundity and young-of-year
- Keep ~700 eggs per female per season in ~3 clutches.
  - The sim's per-clutch ln-fecundity with ~3 clutches matches Phillips. Do not lower it toward 250 unless Fritz & Garside's Nova Scotia counts say so.
- **Egg-to-first-spring survival target: ≥ 0.2 % to replace, 0.5–2 % for a resilient population.**
  - Young-of-year should reach ~32–50 mm by October.
  - First-winter loss ~30–40 % at the mean size (FWM generic).
- **Audit the young's fate by stage (`fryfate`), as the repo's own stage-survival practice requires.** Find where the 0 % arises: unhatched eggs (the hatch-index `bare` 0.3), larvae starving (see `white_perch_regulation.md`: killifish larvae should draw on a small-zooplankton and littoral pool), or schools eaten. This is the first lever, ahead of the adults.

### 3. Fallfish strike rule (the largest error)
- **Now** (code): `Lpisc` 10 cm. Fallfish use the "other" class (`PRED3.other`: aMax 4 strikes/h, active 0.3 by day). Capture on killifish is `CS3` 0.5 × (1 − Lprey/(0.88·Lpred)) × 0.15 into a school. Founders number 85/ha against pickerel's 25.
- The shallows term (`SHALLOW_K` 0.02) lets a 15-cm fallfish strike at full effect over 0.3 m and partly down to 0.15 m, inside the killifish's strip.
- **Targets:** fish ≤ 10–20 % of adult fallfish diet mass outside fry pulses; killifish ≤ 5–10 % of the killifish's predation deaths.
- **Mechanism options** (one at a time, with a ≥ 3-seed A/B):
  - (a) Raise fallfish `Lpisc` to ~15–20 cm, and scale their fish strikes by a partial-piscivore factor of ~0.2. The diet is mostly drift and surface insects at an evening peak, with no fish below 100 mm (Johnson et al.).
  - (b) Give fallfish their own `PRED3` entry: aMax ~1/h; activity weighted to dusk; ~0 at night.
  - (c) Make fallfish shore-shy: their day bed band of 0.5–2.5 m should not reach below ~0.5 m on the shelf, since fallfish keep to pools and to gravel at the mouths.
  - Keep the fallfish's own vulnerability: the young are prey.

### 4. White perch and yellow perch strike rules
- **White perch:** fish 26 % of adult food in Maine, mostly yellow perch, smelt and white perch.
  - Killifish should be ≤ ~5 % of white perch fish prey, and white perch ≤ 15 % of killifish deaths.
  - The night onshore move is when they meet killifish. Keep their night strikes low (`act` night 0.05; non-visual at the surface).
  - Make sure the killifish's night band (now 0.1–0.6 m, stage R item 6f) does not sit on the white perch's 0.9–1.5-m flats.
- **Yellow perch:** the more piscivorous of the two (fish 46 % at 16–35 cm), mostly on perch and white perch. They should eat more young perch and white perch than killifish.
- **Both perches:** the into-school factor of 0.15 (confusion) and the "white perch, no confusion" experimental result (Morgan & Godin) conflict. Keep 0.15 until Morgan & Godin's rates are read.

### 5. The refuge
- Keep the day strip shallow: < 0.35 m now, field < 0.15–0.3 m.
- Add a **shore-hugging rule**: schools within a few metres of the waterline and along it, rather than a depth band that the young and hungry leave. Killifish are netted whole in 15 cm of water 2.5 m from shore (Ward et al. 2002, cited in the code). Make the strip's outer edge, 0.3–0.6 m, the exception rather than the feeding ground.
- In autumn, below ~12 °C, let killifish go deeper and quiescent. Exposure then rises, but predators' feeding falls too.

### Checks (≥ 3 seeds, ≥ 2 years)
1. Killifish adults: Z ≈ 1.0–1.5, rising with age.
2. Recruits per spawner ≥ 1, with egg-to-age-1 survival ≥ 0.2 %.
3. Kills by predator against the table above; fallfish ≤ 10 %.
4. Adult fallfish diet ≤ 20 % fish by mass outside the May–June fry pulse.
5. White perch fish share ~20–30 %, killifish a minor part of it.

---

## Addendum (2026-10-20): the three literature sub-reports (Q1 dynamics; Q2 predators and persistence; Q3–Q4 fallfish and perch)

The note above was handed back before its sub-researchers reported. Their findings, condensed (tags as above; [SUR] surrogate).

### Q1 — population dynamics
- **No direct survival estimate** (mark–recapture or life table) exists for banded killifish. Fritz & Garside 1975 (Can. J. Zool.
  53:361, doi:10.1139/z75-047) 403; Chippett 2004 (MUN thesis) too large to fetch.
- **Catch curve** (Phillips, Ewert & Speares 2007, Northeast. Nat. 14:269 [FT]; summer seine sample ages 1/2/3 = 139/95/9):
  Z ≈ 1.37/yr (S ≈ 0.25; Chapman–Robson S 0.32); stepwise S age 1→2 0.68, 2→3 0.095 — "no age-3 fish survived spawning".
  Fall age-0: 32 ± 1.9 mm TL. Fecundity 526 ± 37 (age 1, 67 mm), 744 (age 2), 1,062 (age 3); ~3 clutches; GSI peak 15.8 % mid-July.
- **Density:** Onondaga Lake (NY) quarter-sweep seine, 2009: 62.9 ± 15.7 non-YOY killifish per haul ≈ **0.34 fish/m² (~3,400/ha
  of the seined shore zone)**, a minimum [derived]; larval catch per haul 0.06–43.6 over 2000–03 (**~700-fold** year-to-year).
  Burton's Pond (NL, 0.81 ha; Mitchell & Purchase 2014 [FT]): ≥ 568 adults (≥ 700/ha) 13 yr after 6–9 founders (λ ≥ 1.38/yr).
- **Young-of-year:** 25.6 ± 4.5 mm SL on 21 Sep (Burton's Pond); length gain roughly linear early, plateau by early September,
  size set by spawning date (Keast & Eadie 1984 [ABS]); Opinicon 49.5 mm by mid-October (COSEWIC). Hatch: 0 % at 10 °C, ≤ 10 % at
  16 °C, > 74 % at 22–28 °C (12.5 d at 22 °C, 7.1 mm SL) — "complete cohort failures" possible in cool summers (Penney et al. 2019,
  J. Freshw. Ecol. 34:771, via the thesis [FT]).
- **Winter:** into deeper parts of lakes in late fall and winter, back to the shallows after ice-out (COSEWIC 2003, Godin pers.
  comm. [FT]). Mummichog [SUR]: fasting at ≤ 3.1 °C (Reeve et al. 2022); YOY annual mortality "up to 99.5 %", adults 54 %
  (Meredith & Lotrich 1979, via Abraham 1985 [SEC]).
- **Replacement** [derived]: lifetime eggs per female 526 + 744S + 1,062S² → egg-to-age-1 survival of **~0.17–0.28 %** replaces
  the stock (~1 % at mainland fecundity ≤ 250). Adult losses of ~77 % a year are not unrealistic for a fish that lives 3–4 years
  and often dies after spawning — persistence rests on the eggs and young.

### Q2 — who eats killifish, declines, what lets them persist
- **No numeric killifish share** found for pickerel, smallmouth, perch, white perch, fallfish, loon, merganser or eel diets. The
  best numbers are BELTED KINGFISHER pellets (White 1953, Bull. FRB Can. 97 [FT]): killifish 10.5 % of items (Gaspereau Lake NS),
  18.7 % (North River NB), 12.4 % (Moser River NS); "largely" sticklebacks and killifish at shallow, weedy Mill Lake. Great blue
  heron: "killifish" in 5 of 150 stomachs (USBS 1930 [SEC]). Eel: none of 880 (Moffatt 2020 [FT]).
- **Smallmouth in Nova Scotia lakes:** > 99 % invertebrates by weight (Wentzells Lake 2019 lavage, 85 bass [FT]); "dominated by
  insects" (Lake Ainslie; LeBlanc 2010 [FT]). Pickerel there: white perch, pickerel, salmon smolts, brook trout, sucker — no killifish.
- **Declines:** lakes with pickerel, bass and burbot have "scarce small shore fishes" (White 1953); littoral predators → median 0 vs
  2 minnow species in 195 northeastern lakes, intact only in northern Maine (Whittier et al. 1997, CJFAS 54:1593 [ABS]); a third as
  many minnow species with top predators in the Adirondacks (Findlay et al. 2000 [ABS]); killifish densities fell within ~3–4
  years of an introduced snakehead (Rohrback et al. 2023, NE Nat. 30:429 [ABS]). Long coexistence: Grand Lake NS (bass since 1960,
  killifish still "rich"), and Hot Brook (both since 1949).
- **Depth — conflicting evidence:** Helfman 1981 (via McInerny & Cross 2004 [SEC]) — schools at 1–1.6 m by day, dispersing into
  < 0.6 m at night; Chippett 2004 (via COSEWIC) — dense shallow vegetation by day, deeper rocky water at night; Everhart 1958 (Maine)
  — "rarely stray into water much over a foot in depth" [FT]. Power 1987 [SUR, FT]: in streams birds took tethered catfish in
  < 18 cm (0 of 6 survived); fish < 3 cm favoured in the shallows; Laplante-Albert 2008 [FT]: shallow water not always a refuge.
- **Behaviour:** predator-experienced Opinicon killifish kept farther from a bass and moved shallower (Dunlop 1988, via Gabora &
  Colgan 1990 [FT]); larger groups with alarm cues (Hoare et al. 2004); hungry fish leave shoals more (Hensor et al. 2003).

### Q3–Q4 — fallfish, white perch, yellow perch as predators
- **Fallfish:** the food of fallfish in Canada "practically unknown" (Scott & Crossman 1973 [FT]); omnivores — algae, fish,
  insects, crayfish (Reed 1971, TAFS 100:717 [ABS]); in a NY salmon river, eggs 86 % of the diet of fish ≥ 150 mm in the fall egg
  pulse (Johnson et al. 2009 [ABS]), parr in May (Johnson et al. 2016 [ABS]); terrestrial invertebrates the largest share in summer
  (Johnson 2015 [ABS]). NO record anywhere of fallfish eating killifish; no lake diet numbers. Speculative only: White 1953 blamed a
  river's scant small fish on "pickerel and possibly the perch and large fallfish".
- **White perch:** fish > 110 mm in Tedford Lake NS ate killifish, yellow perch, sticklebacks (Smith 1947 via Scott & Crossman
  [SEC]); fish ~35 % at 178 mm, ~70 % at 216–254 mm (Bay of Quinte, Leach 1962 [SEC]); Lake George ME (no alewives) mainly Cladocera
  (Moring & Mink 2002 [ABS]); amphipods and chironomids, fish only > 300 mm (L. Ontario, Elrod et al. 1981 [ABS]). Morgan & Godin
  1985 (Z. Tierpsychol. 70:236 [ABS]): white perch on killifish — risk falls with school size (dilution), NO confusion effect,
  stragglers attacked more.
- **Yellow perch:** piscivory "relatively uncommon" — one minnow per 35 h per perch in the lab with prey always present
  (Paszkowski & Tonn 1994, TAFS 123:855 [FT]); fish < 6 % of the diet of ≥ 200-mm perch except June (West Long Lake, Wilkens et al.
  2002 [ABS]); feeding ~07:00–18:00, little or none at night (Scott & Crossman).
- **Cooper 1941** (repo): no killifish in 1,252 white perch or 160 fed yellow perch stomachs [derived bound: < 0.3–0.6 killifish per
  white perch per summer, < 2–5 per yellow perch — if his lakes held killifish where sampled].

### Implications added
- Fallfish should take killifish rarely if ever (done: Lpisc 18, 2026-10-20); white perch's school term should be dilution (~1/n)
  without confusion; yellow perch should not hunt fish at night.
- Judge killifish by recruitment (egg → age 1 ≥ ~0.2 %) and by age-0 length (~25–32 mm by late September), not by adult survival.
- Birds (kingfisher, heron, merganser) are real killifish predators the 3-D lakes don't have yet.
