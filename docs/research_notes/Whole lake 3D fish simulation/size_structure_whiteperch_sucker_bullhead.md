# Size structure of white perch, white sucker and brown bullhead (Hot Brook check)

Compiled 2026-10-18. This note settles a conflict between the 3-D sim's founders and the census (`docs/FISH_CENSUS.md` §2;
basis in `../Hot Brook populations and water/species_numbers_northern_lakes.md`). Both count fish ≥ 7.5 cm, by number, in late summer.

| Species | Sim founders | Census | Where the sim's split comes from |
|---|---|---|---|
| White perch | 68 % 7.5–15 cm, 32 % 15–22, 0 % > 22 | ~35 / ~45 / ~20 % | `fish3.js` S3 `found: 0.72`: the growth curve is scaled to 0.72, after "Maine's crowded white perch stay ~25–45 g" |
| White sucker | 66 % < 30 cm | ~45 % < 30 cm | `species.js` vb L∞ 52, k 0.2, t0 −0.3; M 0.32 |
| Brown bullhead | 69 % < 20 cm | ~50 % < 20 cm | `species.js` vb L∞ 38, k 0.25, t0 0; M 0.54 |

---

## Summary: which split does the evidence support?

**Method.** A census by number of every fish ≥ 7.5 cm is set mostly by two things:
- **Growth:** how many years a fish spends in each size class.
- **Survival:** how many fish are left to reach the next class.

In a steady state, with recruitment constant and survival S, the first J year-classes hold a share 1 − S^J of the age-1+ fish (§0). Nets and angling see a different, larger-fish picture (§4). Each split was checked against the field's growth and survival, and against the census's own biomass.

### 1. White perch: neither split as it stands
The question is **stunted or normal growth**, and the biomass budget rules out the census's pairing.
- **The sim's split** (68/32/0, mean ≈ 47 g) is a **stunted** population. Examples:
  - MDIFW's crowded lakes;
  - Washington County trout ponds such as Southwest Pond and Pleasant River Lake;
  - North Carolina high-density reservoirs, where L∞ is about 165 mm.
- **The census's split** (35/45/20) is what **normal Maine growth** gives at M ≈ 0.45 (≈ 36/40/24, mean ≈ 113 g, §1.6). Normal Maine growth means:
  - ~20–25 cm at age 4 (MDIFW);
  - New Jersey lakes: 71, 146, 201 and 226 mm at annuli I–IV.
- **But the census cannot have both its split and its density.** At its 750/ha, the census split means **≈ 85–110 kg/ha of white perch alone**.
  - That is against the census's own 20–35 kg/ha for white perch, and against 50–90 kg/ha for *all* fish in soft-water lakes.
  - The census's 20–35 kg/ha at 750/ha needs a mean of 27–47 g. Only a stunted split gives that.
- **For a Hot Brook-like lake, the evidence leans to intermediate-to-normal growth:**
  - The lakes are oligo-mesotrophic (TP 9–10). Stunting is linked to eutrophic waters (Hines 1981) and to "scarcity of predators" (Stanley & Danie 1983).
  - Bass and pickerel are abundant.
  - Comparable eastern-Maine lakes report normal-sized white perch: Crawford ~30 % > 10 in in a 1973 sample, Meddybemps 10–12-in fish, Long Lake 12–13 in.
  - Maine's statewide standing crop averaged **≈ 80 g a fish** (Jordan 1981).
- **The one first-hand note points the other way.** The human says "the perch are small", which may mean white perch.

**Recommended:**
- **Split: ~55 % 7.5–15 cm, ~35 % 15–22, ~10 % > 22** (mean ≈ 70 g). That is the sim's curve at `found` ≈ 0.85 instead of 0.72.
- **Density: ~400–500/ha.** That keeps white perch at 30–35 kg/ha.
- **Fallback:** keep 750/ha **and** the stunted split (≈ 68/30/2). Do not pair 750/ha with the census split.
- **Confidence:**
  - **High** that the census's split and density are inconsistent.
  - **Low–moderate** on stunted versus intermediate for Hot Brook. One answer from the human would settle it: are the white perch they catch mostly 6–8 in, or 9–12 in?

### 2. White sucker: the evidence sits between the two, closer to the sim
- **Steady state.** With adult survival 0.70–0.75 (Coble 1967) and the sim's M 0.32, the share under 30 cm depends on the age at which suckers reach 30 cm:

  | Reaches 30 cm at | Share < 30 cm | Example |
  |---|---|---|
  | ~age 2.2 | ~49 % | Big Bear's thinned period |
  | ~age 3 | ~55–62 % | Big Bear, dense: **342 mm at age III** in a 45°N Michigan lake |
  | ~age 4 | ~66–68 % | the sim's curve |
  | ~age 7 | ~84 % | subarctic Québec: L∞ 52–56, K 0.13–0.15 |

- **The census's 45 %** needs growth at least as fast as Big Bear's thinned years, plus steady recruitment.
- **Recruitment swings widely** (Big Bear's strong and weak decades), so a single year can be adult-heavy.
- **Eastern-Maine EMAP nets** caught ~90 % "adult" suckers. That is a gear artefact, not the population.

**Recommended:**
- **~60 % < 30 cm** (plausible range 50–75 %).
- **Confidence: low.** No Maine length-at-age was readable. The Begley et al. 2017 Maine data are behind blocks.

### 3. Brown bullhead: the evidence supports the sim
- **Survival.** Moe Pond, NY gives 48 %/yr. With that, age 1 alone is ~52 % of age-1+ fish, and ages 1–2 are ~77 %.
- **Growth.** Even fast-growing Ottawa River bullheads (Rubec 1975: 196 mm at the 3rd annulus) reach 20 cm only at about age 3. So < 20 cm in late summer covers ages 1–2 and part of 3, giving **~70–80 % < 20 cm**.
- **Weight check.** Moe Pond's age-1+ mean of ≈ 50 g also means most fish are < 20 cm.
- **What the census needs.** 50 % requires 20 cm by about age 1.8 together with high survival. No northern data showed that.
- **Two errors in the census basis.**
  - Its arithmetic: "48 % survival puts about half at age 1–2" should read *age 1 alone*.
  - Its own assumed bullhead mean of ~90 g fits a ~70/30 split, not 50/50 (≈ 155 g).
- **Possible sim lever.** Predation by bass and pickerel can make small bullheads scarce and the survivors grow fast (Cassidy, MI: mean ≈ 290 g). That points to a growth/predation lever in the sim, not a founder split.

**Recommended:**
- **~70 % < 20 cm** (range 60–80 %). Keep the sim's.
- **Confidence: moderate.**

### Bottom line for the census table
- **White perch:** change to ~55/35/10 with ~450/ha, or keep 750/ha with a stunted split.
- **Sucker:** change to ~60 % < 30 cm.
- **Bullhead:** change to ~70 % < 20 cm.
- **Biomass check** (sim L–W, at these splits) [inf]:
  - white perch 450 × 70 g ≈ 32 kg/ha;
  - sucker 70 × ~300 g ≈ 21 kg/ha;
  - bullhead 100 × ~95 g ≈ 10 kg/ha.

---

## Conventions
Flags follow `pickerel_mortality_cannibalism.md`.

**Source flags:**
- **[ft]** full text read (for scans, the pages named);
- **[abs]** abstract only;
- **[snip]** search-engine summary only;
- **[ag]** agency document;
- **[inf]** my inference or arithmetic;
- **[sur]** surrogate species or region.

**Region tags:**
- **[ME]** Maine;
- **[NE]** rest of New England, NY, NJ, Ontario, Québec, Atlantic Canada;
- **[MI]** Michigan / Great Lakes;
- **[S]** southern or midwestern reservoirs.

Quotes are under 15 words. Lengths are total length (TL). Weights come from the sim's own L–W unless stated:
- white perch W = 0.012·L^3.13;
- sucker W = 0.006378·L^3.136;
- bullhead W = 0.01069·L^3.105 (L in cm, W in g).

---

## 0. How a census by number follows from growth and survival [inf]

**Share of age-1+ fish in the first J year-classes** (steady recruitment, constant survival S): 1 − S^J.

| S (annual survival) | M (≈ −ln S) | J = 1 | J = 2 | J = 3 |
|---|---|---|---|---|
| 0.48 (Moe Pond bullhead) | 0.73 | 52 % | 77 % | 89 % |
| 0.55 | 0.60 | 45 % | 70 % | 83 % |
| 0.64 (sim white perch, M 0.45) | 0.45 | 36 % | 59 % | 74 % |
| 0.73 (sim sucker, M 0.32) | 0.32 | 27 % | 47 % | 61 % |

**Founder model.** I re-ran the sim's founder rule (`fish3.js` `found()`: age = a0 + Exp(M), length = `found` × vb(age)) under different growth curves. The script is in the session scratchpad; it reproduces the sim's 68/32/0, 66 % and 69 %.

| Scenario | Late-summer length at ages 1–5 (cm) | Split | Mean W |
|---|---|---|---|
| **White perch** (classes 7.5–15 / 15–22 / > 22 cm) | | | |
| sim (L∞ 30, k 0.3, t0 −0.5, M 0.45, found 0.72) | — | 69/31/0 | 47 g |
| same, found 0.80 | — | 60/36/3 | 61 g |
| same, found 0.85 | — | 56/36/8 | 71 g |
| same, found 0.90 | — | 52/36/12 | 83 g |
| same, found 1.0 | 11, 16, 19, 22, 24 | 45/34/21 | 110 g |
| normal growth, early-fast (L∞ 25, k 0.56), M 0.45 | 14.4, 19.0, 21.6, 23.0, 23.9 | **36/40/24** (≈ census) | 113 g |
| same, M 0.60 | (same) | 45/40/15 | 92 g |
| same, M 0.80 | (same) | 55/37/8 | 73 g |
| stunted (L∞ 18, k 0.35), M 0.35 | 7, 10, 13, 14, 15 | 74/26/0 | 39 g |
| NC high-abundance (L∞ 16.5) | — | 84/16/0 | 33 g |
| NC low-abundance (L∞ 25.5) | — | 51/38/11 | 82 g |
| **White sucker** (< 30 / ≥ 30 cm) | | | |
| sim (L∞ 52, k 0.2, t0 −0.3, M 0.32) | 15, 22, 27, 32, 35 | 68/32 | 252 g |
| sim curve, M 0.40 | (same) | 75/25 | 196 g |
| mid (L∞ 50, k 0.25), M 0.32 | 16, 24, 30, 34, 38 | 62/38 | 296 g |
| fast, Big Bear-like (L∞ 50, k 0.35), M 0.32 | 19, 28, 35, 39, 42 | 49/51 | 417 g |
| La Grande, Québec (L∞ 51.7, K 0.13) | 8, 14, 18, 22, 26 | 84/16 | 136 g |
| **Brown bullhead** (< 20 / ≥ 20 cm) | | | |
| sim (L∞ 38, k 0.25, M 0.54) | — | 69/31 | 108 g |
| sim curve, S 0.48 (M 0.73) | — | 79/21 | 78 g |
| Ottawa-like (L∞ 32, k 0.3), M 0.54 | 14, 19, 22, 25, 27 | 70/30 | 95 g |
| Ottawa-like, M 0.73 | (same) | 80/20 | 73 g |
| slow (L∞ 30, k 0.25), M 0.54 | 9, 14, 17, 20, 22 | 84/16 | 58 g |
| fast (L∞ 36, k 0.4), M 0.54 | 15, 22, … | 55/45 | 163 g |

**What the scenarios show:**
- For white perch, both splits are demographically possible. They describe different growth.
- For sucker and bullhead, the census values need growth faster than any northern data found.
- **Recruitment variability.** Lake Erie white perch young-of-year varied "nearly 200 fold". Big Bear sucker recruitment ran in strong and weak decades. Either makes any one-year snapshot depart from these equilibria, so the founders should use the equilibrium, not a snapshot.

---

## 1. White perch (*Morone americana*)

### 1.1 Adult sizes in Maine and New England
- **MDIFW species page [ME][ag][snip]** (maine.gov returned HTTP 403):
  - an average 8–10-in (20–25 cm) perch weighs ~0.45 lb (≈ 204 g) and is ~4 years old;
  - a 6-year-old "can be anywhere from 6 to 12 inches";
  - size depends on habitat and density.
- **MDIFW White Perch Management Plan, 2002 (Smith) [ME][ag][snip]** (PDF 403; quoted in earlier notes):
  - stunting can be so extreme that a 6-year-old is 4 in (~10 cm);
  - "Usually the problem is one of too many small perch."
  - The plan also says Maine white perch dynamics are not well understood.
- **Statewide standing crop [ME][ft]** (Stanley & Danie 1983, from the OCR text layer of the NRC copy):
  - Jordan (1981, MDIFW plan) estimated Maine's white perch at **60,175,000 fish = 10,590,800 lb**, mostly in inland lakes and ponds. That is **≈ 80 g a fish** [inf].
  - The annual catch was ~3.5 million fish, about 6 % of the stock.
  - The size base of the estimate is not stated.
- **Connecticut DEEP [NE][ag]** (prior note, primary): landlocked populations tend to be over-abundant and stunted; adults are commonly 5–9 in (13–23 cm).
- **Vermont, Lake Champlain [NE][snip]:** generally 9–10 in; most live 5–7 years. This is a recent invader, which usually means fast growth.
- **New Jersey lake inventories 1990–95 [NE][ft]** (NJDFW profile): adults typically 125–250 mm. "Populations often stunt when in high abundances."

### 1.2 Length at age
| Population | Lengths | Flag |
|---|---|---|
| NJ lakes (statewide summary) | annuli I–IX: **71, 146, 201, 226, 240, 259, 275, 288, 314 mm** | [NE][ft] |
| Maine, typical | ~20–25 cm at age 4; a 6-year-old 15–30 cm | [ME][snip] |
| Maine, extreme stunting | ~10 cm at age 6 | [ME][snip] |
| Lake Winnipesaukee, NH (2016 fyke nets) | **200 mm at 2.93 yr** on average; PSD = 100, "an extreme number of large fish" | [NE][snip; PDF 403] |
| Hudson River | maximum age 7; most growth in the first 3 years | [NE][snip] |
| North Carolina Piedmont reservoirs (< 700 ha; 2011 AFS abstract) | high-abundance pair L∞ **165 and 166 mm**; low-abundance pair **225 and 285 mm**; maximum ages ≥ 13 in all four | [S][snip] |
| Western Lake Erie (FishBase) | L∞ 26.1 cm, K 0.68 | [MI][ft table] |
| Pennsylvania plan | ~3.4 yr at 8 in, ~5.7 yr at 10 in | [NE][snip] |

- **Maturity:** males at 72–80 mm, females at 90–98 mm, ages 2–4 (Hardy 1978, Mansueti 1964, via Stanley & Danie 1983) [ft]. Small, stunted fish still mature and spawn.

### 1.3 How common is stunting, and what predicts it?
**Stanley & Danie 1983 (USFWS profile, Maine Coop Unit) [ft]:**
- Scott & Crossman (1973): landlocked populations in small oligotrophic coastal lakes grow more slowly than newly expanding ones such as Lake Ontario.
- Taub (1966): growth stays fast for long periods in new populations (Quabbin, MA).
- **Bryant (1972, South Branch Lake, Penobscot County ME, M.S. thesis):** white perch "grow relatively slowly and tend to stunt" throughout their range.
- Mansueti (1961): growth tracks temperature, food and density.
- **Hines (1981, a stunted white perch population in a eutrophic Maine pond; Hermon Pond per a search summary):** stunted populations are often associated with eutrophic waters.
- The profile's abstract: high reproductive potential and "scarcity of predators often lead to stunted populations."

**North Carolina reservoirs [S][snip]:**
- Populations are either abundant, slow-growing and small, or scarce and native-sized.
- Low-abundance fish turned piscivorous in summer. The authors suggest the chance to eat fish sets maximum size.

**Nebraska, Gosch, Pierce & Pope 2010, *Ecology of Freshwater Fish* 19:401–407 [S][snip]:**
- At stunted Branched Oak, predators ate larger, mature white perch.
- At non-stunted Pawnee they ate only immature fish.
- Predation on the largest fish may reinforce stunting.

**Maine evidence on predators [ME][snip]:**
- In Long Pond (Belgrade), white perch were "tiny" before northern pike arrived (early 1980s).
- Pike predation then increased their size (Press Herald column; MDIFW slides date pike to 1983).

**Synthesis [inf].** Stunting is predicted by:
1. high density from strong recruitment, more likely in eutrophic water;
2. few piscivores;
3. little food, especially no fish prey for adults.

Hot Brook has (1) moderate risk only (oligo-mesotrophic), (2) low risk (abundant smallmouth and pickerel, plus loons, mergansers and eagles), and (3) little zooplankton in tea-coloured water, but many young yellow perch and fish for adults. On balance this points to intermediate-to-normal growth, not extreme stunting.

### 1.4 Eastern Maine lakes specifically [ME][ag][snip]
The maine.gov survey sheets returned 403 to the fetch tool, so these are the search engine's summaries.

| Lake | County | White perch |
|---|---|---|
| Crawford Lake | Washington; EMAP lake, 720 ha | abundant; of 60 sampled in July 1973, ~30 % were over 10 in |
| Meddybemps Lake | Washington | anglers often catch 10–12-in fish |
| Long Lake | Washington | a good fishery; some fish reach 12–13 in |
| Webb Pond | Hancock; shallow, isothermal, like Hot Brook | abundant; in a 1987 creel survey ~30 % were over 11 in |
| Burntland Lake | Hancock | an average fishery; most fish 8–9½ in |
| Third (Woods) Pond | Hancock | 14–16-in fish |
| Southwest Pond | Beddington, Washington; a brook-trout pond | so numerous they are stunted |
| Pleasant River Lake | Beddington, Washington | a dense, stunted population |
| George Pond | Penobscot | crowding has stunted the fish |
| Pierce Pond | Hancock | harvest wanted against over-population and stunting |

- **South Branch Lake** (Penobscot, 1954 sheet): liberalise the white perch rules to crop the stock and cut competition with bass.
- **Hot Brook itself** (prior notes):
  - white perch are "abundant" and a principal fishery;
  - the 25-fish limit came from a citizen petition, "not for biological reasons" (MDIFW 2002).
- **What anglers asking for a cap suggests** [inf]: a valued fishery of keepable (≥ 20 cm) fish, not a stunted one. It is weak evidence.
- **Bias** [inf]:
  - Creel and net samples over-represent large fish (§4).
  - "30 % > 10 in" in a gill-net or creel sample is perhaps **~10–15 % > 25 cm** in a census by number.
  - That fits the recommended ~10 % > 22 cm.

### 1.5 Density (the coupling) [ME][snip]
- **No northern per-ha count of white perch ≥ 7.5 cm exists.** The census's 750/ha is a synthesis.
- **East Pond (Belgrade).** A 2008 UMaine thesis (repository retired; search summary only) estimated white perch at **174,000 ± 11,000** in the eutrophic East Pond, and **77,000 ± 23,000** in North Pond.
  - East Pond is 1,823 acres = 738 ha, so ≈ **236/ha** [inf].
  - North Pond is ≈ 85/ha if it is the 2,225-acre pond [inf].
  - The size threshold is unknown; mark–recapture usually counts net-sized fish.
  - Removals from East Pond in 2007–12 took 46.5 tons of fish, 92 % white perch.
- **Reading** [inf]: even an over-abundant eutrophic Maine lake held only a few hundred net-sized perch per ha. So 750/ha of ≥ 7.5 cm fish in an oligo-mesotrophic lake is plausible only if many fish are 7.5–15 cm, and then they are small.

### 1.6 Checking the census [inf]
- **Its split corresponds to normal growth.** Age 1 is ~14 cm and age 2 ~19 cm in late summer, near the NJ annuli. At M 0.45 that gives 36/40/24, mean 113 g. So the split is a real demographic possibility.
- **Its density and biomass correspond to stunted fish.** 750/ha × 110–150 g = **82–112 kg/ha**, against the census's own 20–35 kg/ha for white perch and 50–90 kg/ha for all species. The census note itself assumed a white perch mean of ~35 g.
- **One of the three must give.**
  - **Stunted (the sim):** 750/ha × 47 g = 35 kg/ha.
  - **Intermediate (recommended):** ~450/ha × 70 g ≈ 32 kg/ha.
  - **Normal, the census split:** ~300/ha × 113 g ≈ 34 kg/ha.
- **Where the census's 20 % > 22 cm probably came from.** The earlier note read Crawford Lake's "30 % > 10 in" as "about a quarter over 25 cm". That is a net or creel sample, not a census by number.

---

## 2. White sucker (*Catostomus commersonii*)

### 2.1 Size structure and population evidence
- **Maine bait-harvest studies [ME][abs]:**
  - Begley, Coghlan & Zydlewski 2017, *NAJFM* 37(3):510–523 (doi:10.1080/02755947.2017.1290719). They sampled 976 spawners from six lakes in 2014; the site tags include Chemo Pond, Cold Stream Pond, Graham Lake, Millinocket Lake, Pushaw Lake and Unity Pond, in Penobscot and Hancock counties.
  - Reference (unfished) lakes had larger, older fish, a smaller K and a larger L∞. Annual mortality was ≥ 2× higher in harvested lakes.
  - Zydlewski, Begley & Coghlan 2019, *J. Freshwater Ecology*: the base model matched the empirical spawning-run age structures of three unfished Maine lakes, with **4 % of spawners ≥ age 10**.
  - The numbers (VB, age structure) are in full texts that returned 403. The UMaine thesis repository is retired.
- **Big Bear Lake, MI, ~45°N [MI][ft]** (Schneider & Crowe 1980, RR1887, OCR text):
  - 9,700–15,400 adult suckers (68–109/ha); suckers were 78 % of netted biomass.
  - Age-III suckers averaged **342 mm while dense (1940–43)**, 418 mm after thinning (1944–52), and 380–385 mm in 1953–57.
  - Recruitment came in strong year classes in the mid–late 1930s, was weak in the early 1940s to early 1950s, then strong through the 1950s. It was not related to water level or temperature.
  - Among the conditions the authors list for successful sucker removal: few age I–III suckers present at the time. Juveniles can be scarce in some years.
- **EMAP eastern-Maine nets, 1991–94 [ME]** (counts from `eastern_maine_relative_abundance.md`, primary there):
  - In the six lakes with a juvenile field, white suckers were **183 adults vs 21 juveniles** (10 %), plus young-of-year.
  - The same gear took 31 % juveniles among white perch (1,164 vs 522).
  - So nets catch almost only adult suckers. Juveniles live in the shallows and brooks, where nets do not fish.
- **Chen & Harvey [ON]:**
  - 1995, *TAFS* 124:262–271 [abs], 23 lakes: suckers grew faster at low density with abundant littoral chironomids. Density and food both limit growth.
  - 1999, *Aquatic Living Resources* [abs], 32 lakes: length-at-age was best explained by water chemistry and distance between lakes, not by density. The direction of the chemistry effect is not in the abstract.

### 2.2 Length at age and maturity
| Source | Values | Flag |
|---|---|---|
| FishBase growth table, La Grande Rivière, Québec (54°N) | L∞ 51.7 cm, K 0.13, t0 0.06; and L∞ 55.6, K 0.15, t0 −0.08 → 30 cm at about age 7 [inf] | [NE][ft table] |
| Big Bear Lake, MI | 342–418 mm at age III → 30 cm at about age 2.5–3 | [MI][ft] |
| Ontario life-history database | males mature at 2–3 yr, females at 3–4; adults 25.4–50.8 cm, 0.2–1.4 kg; lifespan 15–25 yr | [ON][ft page] |
| NJ profile | adults typically 180–400 mm; males mature at 2–6, females at 3–7; maximum ~17 yr | [NE][ft] |
| Missouri (Lake Taneycomo) | maturity begins at age 3 and 275 mm | [S][snip] |
| Iowa | 7 in at age 1 to 18.5 in at age 10 | [S][snip] |
| Coble 1967, South Bay, Lake Huron | survival 70–75 % for fish > 38 cm | [MI][snip, prior note] |

The sim's `species.js` cites "5–8 in Maine (MDIFW)" for maturity. I could not verify it; the MDIFW non-sport plan returned 403. If true, it implies slow growth and a juvenile share over 70 %.

### 2.3 Assessment [inf]
- **The sim's curve** (30 cm at about age 4) gives 66–68 % < 30 cm at its M.
- **Big Bear's dense-period growth** (30 cm at about age 3, at Hot Brook's latitude) gives ~55–62 %.
- **The census's 45 %** needs thinned-Big-Bear growth (30 cm by about age 2.2) with steady recruitment.
- **Hot Brook's census density** (70/ha) is low to moderate, which favours faster growth (Chen & Harvey 1995). Soft, low-alkalinity water may slow it.
- **Recommendation: ~60 % < 30 cm** (50–75 %), low confidence. Keeping the sim's curve with `found` ≈ 1.1 gives 61/39 (mean ≈ 340 g), or leave it at 1.0 (66–68 %).

---

## 3. Brown bullhead (*Ameiurus nebulosus*)

### 3.1 Size structure and population evidence
- **Moe Pond, NY [NE][snip]** (McCoy et al. 2001, *J. Freshwater Ecology* 16:389–394):
  - 15.6 ha, mean depth 1.8 m; the only fish are bullhead and golden shiner; unexploited.
  - Age-1+ bullheads: 4,057 (Schnabel), **260/ha and 13 kg/ha**, so a mean of ≈ 50 g, a fish of ≈ 15 cm [inf].
  - Survival of ages 2–5 was **48 %/yr**.
  - A 50 g mean means most age-1+ fish are < 20 cm [inf]: a 20-cm bullhead weighs ≈ 117 g, and 50/50 at 20 cm would give a mean ≈ 120–160 g.
- **Cassidy Lake, MI [MI]** (Schneider 1973, prior note): 48/ha of brown + black bullheads at a mean ≈ 290 g, in a lake with bass and other piscivores.
- **Popular account [snip]** (In-Fisherman): bullheads become numerous and small where bass predation is low; predation thins the small fish and raises mean size.
- **Rubec 1975**, M.Sc. thesis, University of Ottawa; Ottawa River [NE][ft, scanned pages iii, 99, 117–121 read as images]:
  - "Most studies of bullhead have been on overcrowded and stunted populations" (citing Carlander 1969).
  - The Ottawa River fish grew better than US and Czech populations.
  - Density and food mattered more than latitude.
- **EMAP eastern-Maine nets [ME]:** bullheads were **184 adults vs 23 juveniles** (11 %) in the lakes with a juvenile field. Nets are adult-biased; CT DEEP rates bullhead vulnerability to its electrofishing as "low".
- **Pennsylvania trap nets [NE][snip]:** brown bullheads 9–16 in (Lackawanna Lake 2023) and 10–15 in (Lake Oneida 2020). Trap nets show almost no bullheads under 20 cm.

### 3.2 Length at age and maturity
- **Rubec 1975, Governor's Bay, Ottawa River, 1971** — back-calculated TL at annuli 1–8 (spines) [NE][ft p. 99, Table 19]:

  | Sex | Annuli 1–8 (mm) | n at age I |
  |---|---|---|
  | Males | **127, 162, 196, 222, 243, 257** (242 at annulus 7, n = 2) | 114 |
  | Females | **126, 160, 195, 222, 241, 254, 260, 281** | 65 |

  - **Sample by age (males):** II 1, III 16, IV 36, V 46, VI 13, VII 2 fish. The gear caught almost no fish younger than III, which is an example of §4.
  - The first-annulus 127 mm is large for age 1. The spines may have missed the first annulus [inf].
  - Either way, fish pass 20 cm at about the 3rd annulus.
- **Maine (MDIFW species page) [ME][snip]:** adults usually ~10 in (25 cm); > 14 in occasional; 18 in rare.
- **New Hampshire F&G [NE][snip]:** matures in 3 years; adults 6–15 in.
- **NJ profile [NE][ft]:** adults typically 140–340 mm; maximum 9 yr; mature at 2–3 yr.
- **Michigan DNR [MI][snip]:** matures at about 3 yr; rarely lives past 6–8.
- **Invasive Polish oxbow [sur][snip]:** ages 1+–9+, mean SL 14.4 cm, maturity about 3.1 yr at SL 13.3 cm.

### 3.3 Assessment [inf]
- **The census's 50 % < 20 cm** came from a slip. It reasoned that "~48 %/yr survival puts about half the age-1+ fish at age 1–2 (≈ 10–20 cm)". At S = 0.48, age 1 alone is 52 % and ages 1–2 are 77 %.
- **Even at Ottawa growth** (fast for the species), < 20 cm covers ages 1–2 and early age 3, giving 70–80 %.
- **50 % would need** 20 cm by about age 1.8 with S ≈ 0.6. No northern population found grows that fast.
- **Recommendation: ~70 % < 20 cm** (60–80 %); keep the sim's 69 %. Moderate confidence.
- **If Hot Brook bullheads are in fact large** (the human's catches would tell), the lever is predation by bass and pickerel on small bullheads, plus faster growth after thinning. A founder split would not capture that.

---

## 4. Gear selectivity: why nets and anglers overstate size

**What the gear studies show:**
- **Gill nets** [snip]:
  - Mesh selectivity under-samples small fish, so size structure is overestimated for most gill-netted species (a review cited by Colorado DNR).
  - A Michigan inland gear comparison (MI DNR Study 668) found gill nets over-represent white sucker and other species relative to trap nets.
  - Electrofishing caught the smallest fish.
  - Trap nets selected larger sizes of several panfish but showed no significant size selectivity for white sucker or smallmouth.
- **White perch in standard gill nets** (Sowards et al. 2021, *NAJFM*, Kansas reservoirs) [S][abs; PDF 403]: a selectivity correction may be needed to estimate small fish and size structure.
- **Trap and fyke nets:**
  - Big Bear's trap-net pots had 64-mm (2.5-in) stretch mesh [ft], so they retain only larger fish.
  - Pennsylvania bullhead trap catches start at 9–10 in.
  - Rubec's bullhead sample held almost no age I–II fish.
- **Agency nets:** EMAP's eastern-Maine nets took ~90 % "adult" suckers and bullheads and ~69 % "adult" white perch.
- **Electrofishing (CT DEEP)** counts perch only from 13 cm ("stock size") and catches bullheads poorly.
- **Angling** selects the largest, most active fish. Creel figures such as "30 % > 11 in" describe the catch, not the stock.

**What a census by number of all fish ≥ 7.5 cm would look like** [inf]:
- **Its youngest classes are the largest.** For any species with survival ≤ ~0.7, the first one or two year-classes over 7.5 cm hold 45–80 % of the fish (§0). Where those classes are 7.5–15 cm (white perch), < 30 cm (sucker) or < 20 cm (bullhead), the small classes are the majority unless growth is fast.
- **Juveniles are where the nets are not.** They sit in the littoral, the brook and the weeds, which mid-lake gill nets and trap nets do not sample.
- **So net- and creel-based impressions should be corrected toward smaller fish.**
- **The census leaned toward the net picture** for all three species; it overstates the large classes. Only white perch's normal-growth case justifies 35/45/20, and only at about 300/ha.

---

## 5. What this means for the sim [inf]
- **White perch founders:**
  - Raise `found` from 0.72 to ≈ 0.85 (56/36/8, mean 71 g) and lower `perHa` toward ~450 to hold ~30–35 kg/ha.
  - Or keep 750/ha and 0.72 (35 kg/ha).
  - Either pairing conserves biomass. 750/ha at `found` 0.85 would put ~53 kg/ha in white perch alone.
  - Let the sim's food-limited growth then show whether Hot Brook perch stunt or grow.
- **Data page:** `fishside3.CENSUS_SIZE` should use the corrected census splits, or show the census bands as a range: white perch 50–70 / 28–38 / 2–15; sucker 50–75 % < 30; bullhead 60–80 % < 20.
- **Questions for the human:**
  - What size are the white perch they catch at Hot Brook, and are many under 7 in?
  - Are the horned pout they see mostly small?

---

## Access log
**Read:**
- Stanley & Danie 1983 (NRC copy, OCR text layer);
- NJDFW profiles for white perch, brown bullhead and white sucker;
- Schneider & Crowe 1980, RR1887 (OCR text layer);
- Rubec 1975 thesis: scanned pages rendered to images; TOC p. iii, Table 19 p. 99, pp. 117–121;
- FishBase growth tables for white perch and white sucker;
- the USGS abstract pages for Begley 2017 and Zydlewski 2019;
- the Ontario life-history database page;
- a Belgrade MDIFW slide deck (no size data).

**Blocked (HTTP 403 or 500), not circumvented:**
- maine.gov (the MDIFW white perch plan, lake survey sheets, species pages, the non-sport plan);
- NH F&G (Winnipesaukee 2016);
- Taylor & Francis (Zydlewski 2019 full text);
- OSU (Sowards 2021 PDF);
- digitalmaine.com (Cooper 1941, *Fish Survey Report No. 4*, which holds Maine white perch growth tables);
- the Biodiversity Heritage Library (Rubec & Qadri 1982);
- core.ac.uk (Nebraska stunting paper);
- pubs.usgs.gov (HTTP 500);
- afs.confex.com (DNS failure).

A zbook.org mirror of the MDIFW white perch plan was not used: it mirrors a blocked document.

**Not found:**
- any Maine length-frequency or length-at-age table for these three species;
- any whole-lake rotenone or mark–recapture census by length class in New England.

## Sources
- Stanley, J.G. & D.S. Danie. 1983. *Species profiles … (North Atlantic): white perch.* USFWS FWS/OBS-82/11.7. [ft] https://www.nrc.gov/docs/ML0833/ML083380621.pdf (cites Jordan 1981, Cooper 1941, Bryant 1972, Hines 1981, AuClair 1956/1960, Taub 1966).
- NJ Division of Fish & Wildlife species profiles. [ft]
  - White Perch: https://dep.nj.gov/njfw/wp-content/uploads/njfw/White-Perch.pdf
  - Brown Bullhead: https://dep.nj.gov/njfw/wp-content/uploads/njfw/Brown-Bullhead.pdf
  - White Sucker: https://dep.nj.gov/njfw/wp-content/uploads/njfw/White-Sucker.pdf
- MDIFW. White perch species page; *White Perch Management Plan* (2002). [snip; 403]
  - https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/white-perch.html
  - https://www.maine.gov/ifw/docs/strategic-management-plans/whiteperch.pdf
- MDIFW lake survey sheets (Crawford, Meddybemps, Long Lake, Southwest Pond, Pleasant River Lake in Washington Co.; Webb Pond, Burntland Lake, Third (Woods) Pond, Pierce Pond in Hancock Co.; George Pond, South Branch Lake in Penobscot Co.). [snip; 403] https://www.maine.gov/IFW/docs/lake-survey-maps/
- NH Fish & Game. 2017. *Assessment of white perch, Lake Winnipesaukee 2016.* [snip; 403] https://www.wildlife.nh.gov/sites/g/files/ehbemt746/files/inline-documents/sonh/assessment-white-perch-winnipesaukee-2016.pdf
- "Predictors of White Perch Population Size Structure and Density" (NC reservoirs), AFS 2011, Paper 7279. [snip] https://afs.confex.com/afs/2011/webprogram/Paper7279.html
- Gosch, N., L. Pierce & K. Pope. 2010. The effect of predation on stunted and nonstunted white perch. *Ecology of Freshwater Fish* 19:401–407. [snip] https://pubs.usgs.gov/publication/70037671
- Bath, D.W. & J.M. O'Connor. 1982. *Fishery Bulletin* 80(3), Hudson River white perch. [snip] https://spo.nmfs.noaa.gov/sites/default/files/pdf-content/1982/803/bath.pdf
- FishBase growth tables. [ft]
  - White perch: https://www.fishbase.se/PopDyn/PopGrowthList.php?ID=355
  - White sucker: https://fishbase.se/popdyn/PopGrowthList.php?ID=2965
- Press Herald column on Long Pond pike and white perch. [snip] https://www.pressherald.com/?p=125683
- 2008 UMaine thesis on East and North Pond white perch (repository retired). [snip] https://digitalcommons.library.umaine.edu/etd/1150
- Begley, M., S.M. Coghlan & J.D. Zydlewski. 2017. *NAJFM* 37(3):510–523. [abs] https://www.usgs.gov/publications/a-comparison-age-size-and-fecundity-harvested-and-reference-white-sucker-populations
- Zydlewski, J.D., M. Begley & S. Coghlan. 2019. *J. Freshwater Ecology*, doi:10.1080/02705060.2018.1496951. [abs] https://www.usgs.gov/publications/modeling-white-sucker-catostomus-commersonii-populations-assess-commercial-harvest
- Schneider, J.C. & W.R. Crowe. 1980. Big Bear Lake. Michigan DNR Fisheries Research Report 1887. [ft] https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1801-RR1900/RR1887.pdf
- Chen, Y. & H.H. Harvey. 1995. *TAFS* 124:262–271 [abs]; 1999. *Aquatic Living Resources* [abs].
  - https://researchconnect.stonybrook.edu/en/publications/growth-abundance-and-food-supply-of-white-sucker/
  - https://www.sciencedirect.com/science/article/abs/pii/S0990744099001084
- Ontario Freshwater Fishes Life History Database, white sucker. [ft] https://www.ontariofishes.ca/fish_detail.php?FID=19
- McCoy, C.M., C.P. Madenjian, J.V. Adams & W.N. Harman. 2001. *J. Freshwater Ecology* 16:389–394. [snip] https://pubs.usgs.gov/publication/1000834
- Rubec, P.J. 1975. *Age, growth … of the brown bullhead … Ottawa River.* M.Sc. thesis, University of Ottawa. [ft, pages named] https://ruor.uottawa.ca/items/53cf8efe-2c53-480a-b2b0-18433fb4b6d9
- Michigan DNR Study 668 (gear comparison); Colorado DNR review (gill-net selectivity). [snip]
  - https://www.dnr.state.mi.us/PUBLICATIONS/pdfs/IFR/ifrhome/FederalAid/FRI_F81R1/Study%20668.pdf
  - https://dnrweblink.state.co.us/CWCB/0/doc/133207/Page15.aspx
- Sowards et al. 2021. Use of the North American standard gill net for sampling white perch. *NAJFM* 41(4):1207. [abs/snip] https://academic.oup.com/najfm/article-abstract/41/4/1207/7817261
- PFBC biologist reports, Lackawanna Lake 2023 and Lake Oneida 2020 trap nets. [snip]
- Repo notes:
  - `../Hot Brook populations and water/species_numbers_northern_lakes.md` (census basis);
  - `../Hot Brook populations and water/eastern_maine_relative_abundance.md` (EMAP counts, CT DEEP, survey snippets);
  - `../Hot Brook populations and water/fish_numbers_and_new_species.md` (Moe Pond, Cassidy);
  - `docs/FISH_CENSUS.md` §2.
