# Littoral substrate and coarse woody debris of small eastern Maine lakes, and how fish and invertebrates use them

Compiled 2026-10-21 for the 3-D sim of Upper and Lower Hot Brook Lake (Danforth/Weston, Maine): 369 / 274 ha in the model's
lidar shoreline, mean bed 3.0 / 2.6 m, max 5.5 / 4.0 m, unstratified, tea-coloured soft water, undeveloped spruce–fir and
wetland shores (camps on Upper's south shore). The sim needs a SUBSTRATE MAP (rock, gravel, sand, mud/organic) and COARSE WOODY
DEBRIS (CWD), and their consequences. This note does not repeat what the repo already holds; it cites it:

- **SGV** = `Maine lake shores and catchment/shore_geometry_and_vegetation.md` — shore types (MNAP), ice-push ramparts, the
  shore-type mix guess, Christensen 1996 / Marburg 2006 / Sass 2006 wood numbers (§6), the MDIFW Hot Brook sheets (§7).
- **LID** = `Hot Brook populations and water/lidar_and_shallows.md` — the NAIP satellite-derived shallow shelf (dark edge 1.3 m).
- **HBR** = `Hot Brook populations and water/hot_brook_lake_records.md` — MDIFW "shoreline mostly rocky … bottom mostly muddy",
  areas, the brook "rocky and hard bottomed".
- **JRB** = `Real lake ecology for calibration/juvenile_refuges_and_bass_young.md` — young smallmouth on sand/silted rock vs adults
  on wood/cobble (Brown & Josephson 2000; Brown & Bozek 2010), depth refuges.
- **SHH** = `Real lake ecology for calibration/smallmouth_horizontal_habitat.md` — Hot Brook's depth-by-distance-from-shore
  tables (§0), structure weights for bass (§3, Implications (c)).
- **IPP** = `Hot Brook populations and water/invertebrates_plankton_plants.md` §1 — virile crayfish densities, cobble preference
  (Hill & Lodge 1994), shelter exclusion (Garvey et al. 1994).
- **LLS** = `Maine lake shores and catchment/land_lake_subsidies.md` §2 — litterfall amounts, "most litter within 10 m of shore",
  litter decay rates, leaf packs as habitat.
- **LIT** = `Whole lake 3D fish simulation/littoral_invertebrates.md` — bed fauna under weeds 5–15× bare bed; humic lakes poorer in
  mayflies.
- **FIELD** = the user's own observations (auto-memory `hot-brook-field-observations.md`): the camp dock shore "clear golden water
  over cobble/gravel with NO plants out to ~0.6 m, cedar + boulders on the bank"; the brook mouth "a cobble riffle runs straight
  into a lake"; slow brook runs with "orange-brown sand, sunken wood"; the dry year (Aug 2025) "an exposed stony band grown with
  grass"; shores "only a foot or two deep … maybe to chest height before it gets deeper, probably where the water gets darker";
  crayfish NOT common; schools of small fish in the shallows.

**Tags.** [primary] I read the original's full text; [secondary — X citing Y]; [abstract]; [snippet] a search-result snippet
only; [inf] my inference or arithmetic (the Hot Brook numbers are computed from the sim's own true-scale grid,
`src/w3/true/hotbrook3d.js`, with throw-away scripts kept outside the repo). Regions: [ME] Maine, [NE] New England,
[ON] Ontario, [WI] Wisconsin/upper Michigan, [other].

**Instructions seen in fetched content.** None, by me or by the two sub-researchers whose reports §3–§5 draw on.

**Search budget.** The turn's shared web-search budget ran out partway through; after that only known URLs and DOIs were
fetched. Several key papers were therefore not read (see each section's Gaps and the access log).

---

## 0. Takeaway table

| Quantity | Value | Basis |
|---|---|---|
| Boulder–cobble share of nearshore AREA (≤ 3 m), small Shield lakes | **~11 %** although it lines km of shore; detritus–sand mixes ~40 %, organic > 10 %, pure sand and bedrock ~5 % each | Cooley 1997, six ELA lakes [primary] |
| Measured 0–3-m cover, soft coloured lake (Sanford, WI) | silt 70 %, sand 12.7 %, organic debris 4.4 %, **gravel and coarser ~6 %** | Short 2001 [primary] |
| Wave base that sets the rock/sand → mud boundary | EBD ≈ **1.66·√Fmax(km)** m (¼ of the deep-water wavelength); critical (annual-storm) waves ~77 % of maximum; slopes > ~3 % (Rowan) or ~10° (Cooley) push mud deeper | Rowan et al. 1992 [snippet; secondary via Cooley]; [inf] |
| Share of bed that is erosion + transport (Håkanson) | 25·DR·41^(0.061/DR), DR = √a/D̄ → **21–24 %** for Hot Brook (DR 0.57–0.68) | Håkanson 1982 [secondary — USBR]; [inf] |
| Same share from per-cell fetch (Hot Brook grid) | **23.8 % / 24.0 %**; mud line 1.5–2.3 m, median ~1.8 m; 89–98 % of the < 30-m shore strip wave-worked | [inf] |
| Proposed Hot Brook bed (whole lake) | boulder–cobble 3–5 %, cobble–gravel–sand 4–5 %, sand 2.5–4.5 %, sand–detritus 3–5 %, organic shore water 6–8 %, gyttja ~76 % | [inf] |
| Shoreline by land cover (sim grid, NLCD-based) | wetland-fringed 38 % (Upper) / 46 % (Lower); stony waterline likely 50–65 % | [inf] |
| Littoral CWD, undeveloped north-temperate lakes | mean **555 logs/km** (16 lakes); low-development median **156 (≥ 5 cm) / 66 (≥ 10 cm) per km** at the 0.5-m contour; wood at 61 % of sites, 20–4,200/km where present | Christensen 1996 [abstract]; Marburg 2006 [primary] |
| What sets CWD | riparian downed wood (partial R² 0.48–0.54); fewer on wetland shores (R² 0.21) and exposed sites; > 9 buildings/km → < 200/km; recovery ~2 centuries | Marburg 2006 [primary]; Christensen 1996 [abstract] |
| Smallmouth nest substrate and cover | 0.4–2.5 m (most 0.5–1.5); ≥ 40 % gravel–cobble (6.4–150 mm); gravel chosen ~30× availability on silt; 89–100 % next to rock or wood; log diameter explained 50 % of fry | Short 2001; Saunders 2006; Rejwan 1999 [primary] |
| Nest success by substrate | egg → swim-up mortality **28 %** coarse vs **69 %** silty | Short 2001 [primary] |
| Nest density | 3.5–27 per km (4 WI lakes); 0.24 (weed) – 1.18 (sand + rock) per 100 m (7 ON lakes); 12.5 vs 3.6/km on warm vs cool shores | Saunders 2006; Chu 2001; Rejwan 1999 [primary] |
| Crayfish and rock | young (12–14 mm CL) survive bass only in ~2-cm crevices; size refuge at ~20 % of predator length; virile 8× rusty's loss on sand when tethered with fish | Butler & Stein 1985; Mather & Stein 1993 [primary]; Peters & Lodge 2008 [snippet] |
| Wood draws fish | structures < 1 % of area held 5–10 % of bluegill; richness rises with branchiness; 38 % of bass nests within 0.5 m of structure | Wolter 2012 [secondary]; Weis & Sass 2011 [primary] |
| Periphyton by substrate | epipelon chl up to **100×**, production **5–10×** per m² that of rock/wood film; peak production at ~30 % light (Hot Brook ~1.4–3.3 m) | Vadeboncoeur 2006, 2014 [abstract]; [inf] |
| Stony-shore fauna | ~16,000 ind/m² of stone surface, ~73,500/m² of the cobble bed (hard-water lake); 85 % in the interstices; recolonised in ~1 month | Scheifhacken 2006 [primary] |
| Adirondack stony/wood fauna | *Stenonema* 55 % of surface samplers; sweeps *Hyalella* 70 %, *Lirceus* 16 %; wood > non-woody bed | Woo et al. 2025 [primary] |
| Wave detachment of bed fauna | 1.0–1.2 N/m² onset, 50 % at 1.5 N/m²; sand > wood > stones > reeds > roots | Brauns 2009 [primary] |
| Leaves on the bed | exposed shore k 6× sheltered (0.0065 vs 0.0011/d, beech); litter up to 500–1,111 g C per m of shore per yr; pond litter fauna production ~65 g dry/m²/yr | Pabst 2008 [primary]; Oertli 1993 [abstract] |

---

## 1. Substrate composition of small glacial lake littorals, and the rules that predict it

### Takeaway
- **"Mostly rocky" is a statement about shoreline LENGTH, not bed AREA.** On small glacial (Shield) lakes, boulder–cobble
  shores run for kilometres but form narrow margins: in six mapped Experimental Lakes Area (ELA) lakes the boulder–cobble class
  ran along much of the 15.9 km of shore yet covered only **~11 %** of the nearshore area (≤ 3 m deep); **~40 %** was
  detritus–sand mixtures, **> 10 %** pure detritus (organic), and pure sand and pure bedrock **~5 %** each. Rock stands where the
  shore is steep or exposed; sand and organic fill the gentle and sheltered parts. That squares MDIFW's "shoreline mostly rocky …
  bottom mostly muddy" for Hot Brook (HBR).
- **A wave base sets where the rock and sand stop and the mud starts.** Waves winnow the fines out of the till shore and leave a
  lag of cobble and boulder; below the depth where storm waves stop stirring the bed (the "mud deposition boundary depth", Rowan
  et al. 1992) fine organic mud (gyttja) accumulates. That depth rises with fetch; the several largest storms of each year, not
  rare ones, set it; and on slopes steeper than a few per cent (Cooley: ~10°) gravity carries fines deeper than the waves would.
- **Two independent rules agree for Hot Brook: ~22–24 % of the bed is erosion/transport (hard or sandy) bottom and ~76–78 % is
  mud, with the boundary at ~1.5–2.3 m (median ~1.7–1.9 m).** Håkanson's dynamic ratio (area and mean depth only) gives 21–24 %;
  a per-cell wave base from each cell's maximum fetch (Rowan's wave theory, Cooley's form, critical waves 77 % of maximum) gives
  23.8 % (Upper) and 24.0 % (Lower) [inf]. The NAIP photo shelf's dark edge (1.3 m, LID) and the user's "where the water gets
  darker" sit just inside that boundary: the darkening is likely substrate (pale cobble/sand → dark gyttja) as much as depth.
- **The sim today treats the whole bed under 1.5 m as "rock"** (`LIT3.CR_ROCK_Z`; fish3 `rockC`): ~19–20 % of each lake. By the
  ELA and Sanford proportions, and by the rule in the Hot Brook table below, the true hard (boulder/cobble/gravel) bottom is more
  like **6–8 %** of the lake, the sand–gravel–detritus transition another ~10 %, and wetland-fringed shores (6–8 % of the lake)
  carry organic bottom right to the waterline [inf].
- **Measured analogue:** a 36-ha, colour-30, alkalinity-6 Wisconsin lake (Sanford) had **gravel and coarser ~6 %** and silt 70 %
  of its 0–3-m bed (Short 2001).

### Cited findings

**Hot Brook itself** (not repeated; see HBR, SGV §7, FIELD): MDIFW 1949/1965/2004 — shoreline "mostly rocky with some areas of
sand", a large sandy beach on Upper's NE shore, "mud", "the lake bottom is mostly muddy"; wetlands on Upper's S and W and Lower's N
and E; the brook "rocky and hard bottomed". No substrate survey, sediment core or diver transect exists for either lake (HBR Gaps).
The 1949 sheets' text gives no bottom-type marks at the soundings; the digitised soundings (tools/hotbrook) carry depth only.

**The shoreline's land cover in the sim's true-scale grid** [inf] (`shore_types.py`: land–water cell edges by the land cell's
NLCD-based class, 5-m grid): Upper 15.1 km of shore — wetland classes (woody/shrub/emergent wetland) **38 %**, forest 34 %,
`rock_shore` 16 % (the model paints the first land cell of forested shore as rock), grass 5 %, developed 3 %, beach 1 %; Lower
10.9 km — wetland **46 %**, forest 36 %, rock_shore 11 %. NLCD's 30-m "woody wetland" includes cedar/spruce swamp and alder that
may stand behind a stony waterline, so this is an upper bound on organic shores; with MDIFW's "mostly rocky", a stony waterline
on ~50–65 % of the perimeter and an organic one on ~25–45 % is the defensible range.

**Small Shield lakes mapped in detail — Cooley 1997, MSc thesis, University of Manitoba (DFO-funded), six ELA lakes, NW
Ontario** [primary] — [MSpace handle 1993/832](https://mspace.lib.umanitoba.ca/xmlui/handle/1993/832):
- 16 km of shore (15.9 km; lakes ≤ 3 km of shoreline each) mapped by 100-m reaches to 3 m depth (Lake 226 to its 16-m bottom);
  27 ha of nearshore area; "three material types can occupy a single substrate area".
- Combined over the six lakes: detritus, boulder–cobble and bedrock occurred in all six and covered **25 %** of the nearshore
  area; "about **40 %** of the area surveyed were bi-typic detritus/sand mixtures; the mono-typic detrital class area exceeded
  **10 %**"; the boulder–cobble class "covered several kilometers of shoreline combined, had only about **11 %** combined surface
  area coverage because boulder/cobble shorelines are moderate to high slope which form narrow nearshore margins"; "mono-typic
  bedrock and sand classes each occupied **5 %**"; "pure sand is present only in the narrow swash zone of beaches".
- Per lake: L164 (shallow, low gradient) detritus + sand **63 %**, boulder–cobble **12 %**, bedrock ~4 %; L165 (shallow) sand +
  detritus **~80 %**, boulder–cobble **8 %**, bedrock ~8 %; L442 (smallest, least wave energy) detritus-dominated, boulder–cobble
  ~20 %, bedrock 3 %; L373 (largest, deepest) **~60 % sand**, the most wave-sorted; L377 detritus and detritus–boulder–cobble
  **67 %** (a sheltered arm), boulder–cobble 33 % of the main basin; L226 deposition **73 %** of the whole basin, bedrock 13 %.
- Mechanisms stated: exposed shores are boulder–cobble lag (berms) with offshore and longshore fining (boulder → cobble →
  gravel → sand); "highly irregular shores are found only in areas with low wave exposure"; outlets and back bays are
  "energetically quiescent" with organic shores and substrates on slopes < 2°; substrate diversity falls with depth; "the
  gradational classes in these lakes rarely exceed 2 m depth" because "the 2 m depth is below the wave base in most areas"; the
  number of substrate classes and polygons rose with the shoreline development index (polygons r = 0.78, n = 6). Material is
  homogeneous only on very low (≤ 6°) or very high (> 40°) slopes.
- Wave base: Cooley applied Rowan et al.'s maximum-fetch model (deep-water theory valid where depth > ¼ wavelength; wavelength ≈
  20 × wave height; maximum wave height from maximum fetch after Wetzel). For L226 the "maximum depth to the wave base … 1.68 m";
  the predicted mud energy boundary depth (EBD) and the mapped mud deposition boundary depth (DBD) "were nearly coincident … for
  areas with slopes less than **10 degrees**"; steeper slopes push the DBD deeper (gravity). In confined back bays the
  maximum-fetch model wrongly predicted erosion to ~1 m: where **mean fetch < 0.15 km** the bed was depositional.
- Rowan et al.'s "critical" wave height ≈ **77 %** of the maximum: sediment patterns are maintained "by the less intense storms
  which occur several times each year" [secondary — Cooley 1997 citing Rowan et al. 1992].

**Rowan, Kalff & Rasmussen 1992**, *CJFAS* 49:2490–2497, [doi:10.1139/f92-275](https://doi.org/10.1139/f92-275) (cdnsciencepub 403):
- The mud DBD is "the depth … at which the boundary occurs between high-energy erosive environments (coarse-grained
  noncohesive sediments) and low-energy depositional zones"; a wave-theory model "predicts the upper limit to the distribution of
  fine-grained sediments in lakes of any size"; "the several biggest storms each year, rather than extremely rare events" set it;
  deeper coarse areas and mud DBDs occur "usually on slopes greater than 3 %"; maximum fetch and an exposure index, each with
  littoral slope, explained **89–93 %** of the variance in DBD [snippet, from the abstract].
- The applicability/wave-base relation in kilometres of maximum fetch, "h > 1.66 F^0.5" [snippet — DFO Can. Tech. Rep. Fish. Aquat.
  Sci. 2276 (1999) citing Rowan et al. 1992 "equation 5"], is what Wetzel's H = 0.105·√F(cm) (= 0.332·√F km, m), L = 20 H and h =
  L/4 give: **EBD (m) ≈ 1.66·√Fmax (km)** [inf; it reproduces Cooley's 1.68 m for L226]. Marburg et al. 2006 use the same Wetzel
  wave-height term in their exposure index [primary, below].
- In Esthwaite Water (UK; 0.96 km², mean 6.9 m, max 16 m) Rowan's EBD from site maximum fetch was **2.4–3.5 m (mean 3.1)** and
  the wave-mixed depth Zc averaged 1.6 m (max 3.7), but sediment water and organic content changed at **5–6 m**: "neither the Zc
  or EBD models was effective" in that deep, sheltered lake, where wind-driven currents and focusing move fines; the authors
  contrast it with large or shallow lakes, where "wave action is the dominant focusing process" (e.g. a 1.04-km², 1.3-m-mean
  prairie lake) [primary — Mackay, Jones, Folkard & Barker 2012, *Freshw. Biol.* 57:290, [NORA postprint](https://nora.nerc.ac.uk/id/eprint/21085/1/N021085PP.pdf)].
  Hot Brook is the shallow kind (mean 2.6–3 m, shelf slopes ~2–4 % from SHH §0's depth-by-distance table [inf]), so the wave
  base should govern; currents will still carry the finest organic floc toward the deepest water.

**Håkanson's dynamic ratio** [secondary — US Bureau of Reclamation Salton Sea report, App. 1G (Anderson et al.), citing Håkanson
1982, *Water Resour. Res.* 18:1444; formula layout reconstructed — [USBR App 1G](https://www.usbr.gov/lc/region/saltnsea/finalreport/Vol1/App1G.pdf)]:
- Share of the bed that is erosion + transport bottom, a_E+T (%) = 100 − a_A = **25 · DR · 41^(0.061/DR)**, DR = √a / D̄ (a in
  km², D̄ mean depth in m). The curve's minimum (≈ 15 %) is at DR ≈ 0.23 and it reaches 100 % (no accumulation bottom at all) at
  DR ≈ 3.8 [inf, my evaluation]; Terasmaa 2005 defines DR the same way after Håkanson & Jansson 1983 and notes that at very small
  DR slopes govern [secondary — Terasmaa 2005, *Proc. Estonian Acad. Sci. Biol. Ecol.* 54:171, [doi:10.3176/biol.ecol.2005.3.01](https://doi.org/10.3176/biol.ecol.2005.3.01)].
- It "reasonably" estimated the accumulation area of the Salton Sea; the erosion/transport split there was z_t ≈ 0.6·z_a.

**Measured littoral cover, 0–3 m, two small northern Wisconsin lakes** — Short 2001, MS thesis, UW–Stevens Point [primary, via
the fish sub-report — [MINDS@UW 1793/80807](https://minds.wisconsin.edu/handle/1793/80807)] (size classes: silt < 0.2 mm, sand
0.2–6.3, gravel 6.4–76, cobble 76–150, rubble 150–304, small boulder 304–610, large boulder ≥ 610 mm):
- **Sanford Lake** (36 ha; colour 30 Pt-Co, pH 5.9, alkalinity 6 mg/L, wood-rich — the closest analogue to Hot Brook's water):
  silt **70.0 %**, sand 12.7 %, coarse organic debris 4.4 %, gravel 1.9 %, cobble 1.4 %, rubble 1.2 %, small boulder 1.1 %, large
  boulder 0.3 % → **gravel and coarser ≈ 6 %** of the 0–3-m bed [inf, sum].
- **Big Crooked Lake** (a sand lake): sand 76.9 %, silt 10.0 %, gravel 7.6 %, organic debris 2.8 %, cobble 1.3 %, rubble 0.4 %,
  boulders 0.2 % → gravel and coarser ≈ 9.5 %.
- Coarse material sits at the margins; gravel peaks at 1.5–2.0 m; silt rises with depth.

**The New England littoral surveys** — Deeds, Amirbahman, Hugger, Kaufmann, Matthews, Merrell & Norton 2023, *Lake Reserv.
Manage.* 39:141–155, [doi:10.1080/10402381.2023.2207490](https://doi.org/10.1080/10402381.2023.2207490), [PMC10642257](https://pmc.ncbi.nlm.nih.gov/articles/PMC10642257/) [primary]:
- Maine surveyed **102 lakes** (56 deep, 46 shallow, split at 10 m max depth); the region 361; 10 stations a lake; 2007–2019;
  each station a **10 × 15 m** littoral plot (the 15 m along shore; "conventional PHAB surveys only extend 10 m from shore").
- Bottom substrate scored as cover of bedrock, boulder, cobble, gravel, sand, silt/clay/muck, wood and organic detritus in the
  NLA classes 0, 0–10, 10–40, 40–75, > 75 % (Maine splits 10–25 and 25–40 %); metrics ROCKY (boulder + cobble + gravel), FINES
  (silt/clay/muck + organic), SUB_SAND, SUB_PSIZE.
- **Sand rises with shoreland disturbance** (it entered all six condition models); woody habitat (large > 30 cm, small < 30 cm)
  falls with riparian disturbance; "coarse woody habitat may be redistributed to calmer areas of lakes via wave action"; deeper
  lakes' steeper slopes "can redistribute woody habitat into deeper depths" (discussed, citing Mallory et al. 2000 — not measured;
  this corrects SGV §1's reading that the paper measured slope).
- **No mean or median substrate cover is published** — the paper gives model coefficients only. The values exist in the NLA 2007
  /2012/2017 public files (variables `bsfcBedrock … bsfcWood`, `bsfpX` presence, `fcfcSnag`, `fcfcBoulders`; see Gaps).

### Hot Brook prediction [inf]
Computed on the sim's true-scale grid (5-m cells coarsened to 15 m; 36-direction fetch to the shoreline; `fetch_ebd.py`):

| | Upper | Lower |
|---|---|---|
| Maximum fetch per cell, median (10–90 %) | 2.0 km (1.5–2.7), max 3.3 | 2.1 km (1.5–2.8), max 3.3 |
| Wave base EBD = 1.66·√Fmax, median (10–90 %) | 2.36 m (2.05–2.73) | 2.39 m (2.03–2.77) |
| Critical-wave base (0.77 × EBD), median | ~1.8 m (1.5–2.3 by exposure) | ~1.8 m (1.5–2.3) |
| Bed above the maximum-wave base | 32 % | 36 % |
| **Bed above the critical-wave base (erosion + transport)** | **23.8 %** | **24.0 %** |
| Håkanson a_E+T from DR (area, mean depth variants) | 21–23 % (DR 0.57–0.64) | 22–24 % (DR 0.61–0.68) |
| Depth that leaves 21–25 % of the bed above it | 1.66–1.91 m | 1.65–2.00 m |
| Cells with mean fetch < 150 m (Cooley's sheltered-bay test) | 0.3 % | 0.1 % |
| Bed within 30 m of shore that is above the critical base | 89 % | 98 % |

- **Both methods put ~1/4 of each lake on hard/sandy bottom and ~3/4 on mud**, with the mud line at ~1.5 m on the shortest-fetch
  shores and ~2.2–2.3 m at the ends of the long (N–S) axis. Almost the whole < 30-m shore strip is wave-worked; the mean-fetch
  test finds almost no sheltered bays at 15-m resolution, so the organic shores must come from the wetland map, not from fetch.
- The erosion/transport 24 % is not all rock. Using the ELA proportions (boulder–cobble ~11 % of the ≤ 3-m nearshore area, sand
  ~5 %, detritus–sand mixtures ~40 %, organic > 10 %) and Sanford Lake's measured 0–3-m cover (gravel and coarser ~6 %, silt 70 %)
  on Hot Brook's ≤ 2-m nearshore area (27 % of Upper, 25 % of Lower; SHH §0), a plausible whole-lake split is:
  **boulder/cobble/bedrock 3–6 %**, **gravel–sand (incl. the NE beach) 4–8 %**, **sand–detritus mixed 8–12 %**, **mud/gyttja and
  organic 75–80 %**.
- **A rule that gives that split** (`substrate_rule.py`, 5-m cells, 36-direction fetch): r = bed depth ÷ critical wave base
  (0.77 × 1.66 √Fmax); water within 50 m of a wetland-class shore and above the base → organic. Area shares (Upper / Lower):

  | Band | r | Median bed, median distance from shore | Upper | Lower | Suggested substrate |
  |---|---|---|---|---|---|
  | swash and ice-push band | < 0.35 | 0.45 m, 10–14 m | 3.1 % | 4.6 % | boulder–cobble lag, gravel between |
  | upper shelf | 0.35–0.6 | 0.8–0.9 m, 24–39 m | 4.4 % | 5.2 % | cobble–gravel with sand |
  | mid shelf | 0.6–0.8 | 1.3 m, 52–66 m | 4.5 % | 2.5 % | sand and gravel |
  | shelf edge | 0.8–1.0 | 1.7–1.8 m, 66–101 m | 5.2 % | 3.1 % | sand–silt–detritus mix (the transition) |
  | wetland-shore water above the base | — | — | 6.3 % | 8.3 % | organic muck/peat, plant litter |
  | below the critical wave base | ≥ 1 | — | 76.4 % | 76.2 % | gyttja (mud) |

  The median critical base is 1.81 m (Upper) and 1.84 m (Lower), so the band edges fall at ~0.65, ~1.1 and ~1.45 m. A third of each
  lake's area has a wetland as its nearest shore (33 % Upper, 41 % Lower), but only 6–8 % lies within 50 m of one and above the base.
- **Ice push** builds 0.5–1.2-m ramparts of the same lag at the winter waterline (SGV §1) — the stony band the user saw exposed
  in the dry year.

### Gaps
- No substrate survey, core or diver transect for either lake. A wading/snorkel transect at a dozen shore points (substrate class
  every metre to 1.5–2 m depth) would calibrate everything above.
- The NLA public files hold Maine/Northern Appalachian littoral substrate cover for ~50–100 Maine lakes (`nla2007_phab_metrics_a.csv`
  /`_b.csv` + `nla2007_sampledlakeinformation_20091113.csv`; NLA 2012 `nla2012_wide_phabmet_10202016.csv` + `nla2012_wide_siteinfo_08232016.csv`;
  NLA 2017 `nla_2017_phab-data.csv`), all on [EPA's NARS data page](https://www.epa.gov/national-aquatic-resource-surveys/data-national-aquatic-resource-surveys).
  They were not downloaded (several MB; downloading needs the user's go-ahead). Filtering ST = ME, natural lakes, 100–1,000 ha,
  max depth < 8 m would give the shares of bedrock/boulder/cobble/gravel/sand/fines/wood within 10 m of shore directly.
- Rowan's own empirical DBD equations (with slope) and Håkanson's ETA critical-depth formula were not read in the original
  (cdnsciencepub, Wiley 403).
- Wind direction weighting (prevailing summer S–SW, autumn NW storms, not sourced here) would make the N and S ends and the
  lee shores differ; a 36-direction maximum fetch treats all winds alike.

---

## 2. Coarse woody debris in north-temperate lakes

### Takeaway
- **Densities** (SGV §6 has the headline numbers; corrections and additions here): undeveloped lakes average **555 logs/km**
  (Christensen 1996, 16 lakes), developed-lake forested sites 379 and cabin sites 57/km; Marburg's line-intersect count at the
  0.5-m contour (a different, stricter method) gives a 45-lake median of **57.5 pieces/km ≥ 5 cm and 22.5/km ≥ 10 cm** (12
  low-development lakes: **156 and 66/km**), wood at **61 %** of 50-m sites, and **20–4,200/km** where present. SGV's flagged
  Table 1 alignment is now **confirmed** for the 45-lake rows.
- **What sets it:** riparian downed wood (the best predictor, partial R² 0.48–0.54), not live-tree density; fewer logs on
  wetland-fringed lakes (partial R² 0.21) and on wave-exposed sites; beaver-cut wood; building density (> 9 buildings/km → never
  > 200/km). Wood drifts and collects in sheltered sites.
- **Persistence:** decades to centuries in the littoral; losses to development affect littoral communities "for about two
  centuries" (Christensen 1996).
- **No Maine count exists.** Maine's 102 PHAB lakes scored large (> 30 cm) and small woody habitat but did not publish values.

### Cited findings
- **Christensen et al. 1996**, *Ecol. Appl.* 6:1143 [abstract — [urbanforestrysouth record](https://urbanforestrysouth.org/resources/literature/impacts-of-lakeshore-residential-development-on-coarse-woody-debris-in-north-temperate-lakes-957)]:
  16 lakes [WI/MI]; CWD density correlated with riparian tree density (**r² = 0.78**) and negatively with cabin density
  (**r² = 0.71**) at the whole-lake scale; undeveloped mean **555 logs/km**; forested sites in developed lakes 379, cabin sites
  57; the losses "will affect littoral communities in developed north temperate lakes for about **two centuries**".
- **Marburg, Turner & Kratz 2006**, *J. Ecol.* 94:558–568 [primary — [WDNR PDF](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Outreach_NatVarCoarseWoodinLakes.pdf)] [WI]:
  - Method: 45 Vilas County lakes (max depth ≥ 4 m, ≥ 29 ha, plus 3 small manipulation lakes), eight 50-m sites a lake; every
    piece ≥ 5 cm in diameter where it crossed a transect **along the 0.5-m depth contour** and ≥ 150 cm long; counts only (wood is
    oriented non-randomly, so volumes are unreliable).
  - Table 1a (45 lakes): littoral pieces ≥ 5 cm **median 57.5/km (0–712.5)**; ≥ 10 cm **22.5/km (0–372.5)**; riparian live
    trees ≥ 5 cm d.b.h. median 1,038/ha (375–1,875).
  - Table 1b (12 low-development lakes): the text says both size classes had "larger minimum and median values … but a smaller
    total range"; the only values in the extracted layout that fit are **156.3/km (27.5–375.0) ≥ 5 cm** and **66.3/km (15.0–280.0)
    ≥ 10 cm** [inf, from the layout; Weis & Sass 2011 cite "66.3 logs/km" as the median for undeveloped northern Wisconsin lakes
    after Marburg 2006 — secondary, via the fish sub-report].
  - 214 of 352 sites (**61 %**) had wood; where present **20–4,200 logs/km**; no predictor beat a lake random effect for presence
    → "redistribution of logs once wood enters the lake"; density fell with **wave exposure** (exposure = Σ 0.105·√fetch(cm) ×
    the wind's share from 16 directions, 1991–2002 winds), so "areas of low exposure may be important areas for littoral coarse
    wood accumulation".
  - Low-development lakes (12, 0–1.7 buildings/km): littoral wood rose with riparian coarse wood (partial R² 0.48) and fell with
    the share of shoreline in wetlands (partial R² 0.21); undeveloped lakes differ up to **13-fold**; the region's undeveloped
    maxima were ~200 logs/km below Christensen's and Mallory's (those were small reserve lakes).
- **Sass et al. 2006**, *Fisheries* 31:321 [primary — [WDNR PDF](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Outreach_WholeLakeWoodRemovalSass.pdf)]
  (the removal itself is in SGV §6): pre-removal 475 large logs (> 10 cm)/km in the treatment basin, 344/km in the reference;
  wood "the dominant form of littoral structure" (bur-reed only 4.8 stems/m²); logs and limbs removed **to 2 m depth**; yellow
  perch formed **81–93 %** of bass diets before; after removal terrestrial prey were **51–55 %** of bass diet by dry mass and bass
  consumption fell; reference-basin perch averaged **815/ha**, treatment 141/ha before removal and collapsed after. The authors
  note CWH's epixylic algae add little to small-lake primary production directly (Vadeboncoeur & Lodge 2000) but CWH retains
  organic sediment for epipelic algae, which "can provide 50–80 % of total" production.
- **Deeds et al. 2023** [primary, above]: Maine/New England PHAB scored large woody habitat (> 30 cm), small (< 30 cm), live
  trees in water and overhanging vegetation (composites TWH, TLWH, FC_LWH); woody habitat fell with riparian disturbance; wave
  action moves CWH to calmer water. No values published.

### Hot Brook application [inf]
- **Shore classes and expected logs ≥ 10 cm per km** (Christensen and Marburg ranges, Marburg's wetland and exposure effects,
  Maine's history): upland spruce–fir and mixed shore of Lower and of Upper's N/E: **150–500/km** (Maine's lakeshores were cut and
  driven, and fir dies young — budworm, windthrow — which adds small boles); wave-exposed long-fetch shores (the N and S ends):
  the lower half of that; wetland (alder–sweetgale–cedar) shores: **≤ 50–150/km**, mostly alder stems and small conifers; the camp
  shore of Upper's south end: **30–100/km**.
- **Placement:** within ~10–15 m of the bank and over beds < 1–2 m (the sim's `WOOD_W` 15 m and `WOOD_Z` 2.5 m are the right
  order); whole conifers with root wads on the bank sloping into 0.5–2 m; patchy (most 50-m stretches 0 or many); clumped in the
  lee coves. Ice push and spring high water strand and re-sort pieces.
- **Turnover:** inputs a few logs/km/yr (Marburg's resurveys −1.1 to +1.9 logs/km/yr, SGV §6); residence decades to centuries.
  A static map with slow additions (windthrow years) is realistic.

### Gaps
- No Maine or New England lake CWD count, piece-size distribution, branchiness or emergent fraction. The NLA files hold `fcfcSnag`
  (snag fish cover) and `bsfcWood` (wood as bottom substrate) for Maine lakes (Gaps, §1).
- Guyette & Cole 1999 (wood ages in an Ontario lake littoral) was not read (cdnsciencepub 403).

---

## 3. How fish and crayfish use rock and wood

(From a sub-researcher's report, its tags kept, plus the repo's notes. The young bass's substrate segregation, the vegetation
refuge and bass structure weights are in JRB and SHH and are not repeated.)

### Takeaway
- **Smallmouth nests need a gravel patch, and take whatever cover is near.** Nests sit at 0.4–2.5 m (most 0.5–1.5 m) on
  substrate with ≥ ~40 % of particles 6.4–150 mm (gravel and cobble), not heavily embedded; males pick gravel at ~30× its
  availability in a silty lake. Cover within 1–1.5 m of the rim: rock on rocky lakes (74 %), wood on silty ones (78–100 %);
  in a silty, wood-rich lake the nearest log's diameter explained **50 %** of fry production. On silt, egg → swim-up mortality was
  **69 %** against **28 %** on coarse bottom. Densities: **3.5–27 nests/km** of shore in four Wisconsin lakes, 0.24–1.18 per 100 m
  by shore type in Ontario (sand-plus-rock best, weed and leaf litter worst); warm, convoluted shores held more (Opeongo).
- **Crayfish:** rock shelter is what lets virile crayfish live with fish. Survival differs by habitat only when fish are present
  (tethered virile crayfish lost **8×** more than rusty crayfish on sand, 1.3× in weeds); young-of-year (12–14 mm carapace) survive
  bass only in single-occupancy crevices ~2 cm wide; crayfish reach a size refuge at ~20 % of the predator's length. Lakes where the
  rusty invader replaced natives had more cobble (51 % vs 30 % of the littoral). In a soft-water, mostly-mud lake with few crayfish
  (FIELD), the cobble band is where the few should be.
- **Small fish in crevices:** shelter gaps of 2.5 cm kept bass out but let crayfish in, and crayfish evicted darters from them;
  with both predators present darters were 3× more active and lost shelter time. Lake littorals without rock have the least
  shelter. No measured survival-by-crevice-size curve for lake fish was obtained.
- **Wood and fish:** wood-like structures drew **5–10 %** of a pond's bluegill while covering < 1 % of it; fish richness and
  abundance rise with branch complexity (16 species used wood in one lake); predation is highest at the wood's edge, lower inside;
  bass with added wood held smaller ranges in < 2 m; yellow perch need submerged wood or plants for their egg strands; removing
  73 % of a basin's wood collapsed its perch (SGV §6). Largemouth nests: 38 % within 0.5 m of structure, 59 % within 1.25 m.
- **Sunfish and bullhead:** pumpkinseed nest on sand or gravel < 1 m deep in colonies of up to 15; brown bullhead nest on rock or
  sand sheltered by logs, rocks, plants, banks, hollow stumps or muskrat burrows (the tables in `Whole lake 3D fish
  simulation/habitat3d.md` agree).

### Cited findings
**Smallmouth bass nests**
- **Rejwan et al. 1997**, *CJFAS* 54:2007, [doi:10.1139/f97-108](https://doi.org/10.1139/f97-108), Lake Opeongo, ON [primary —
  [harkness.ca PDF](https://www.harkness.ca/PDFs/Contributions%201990s/Rejwan%20et%20al%201997.pdf)]: nests ~0.3–2.5 m; Jones Bay
  (6.3 km of shore) held 111–309 nests a year over 11 years (**~18–49 nests/km** [inf]); whole-lake swims found ~42 % of nests (67.5 %
  present × 62 % detected), so counts × ~2.4 [inf]; patchiness ~4× stronger at 1 km than 100 m and unchanged by population size
  (nest sites not limiting); 65.9 % of returning males nested within 100 m of their last nest [secondary — citing Ridgway et al.
  1991]; guarding 2–4 weeks.
- **Rejwan et al. 1999**, *Ecology* 80:341 [primary — [harkness.ca PDF](https://www.harkness.ca/PDFs/Contributions%201990s/Rejwan%20et%20al%201999.pdf)]:
  nests 0.4–2.5 m, most 0.5–1.5 m; regression tree over 36 one-km sites (r² 0.58): water at 1 m > 17.05 °C during nesting → **12.5
  nests/km** vs 3.6; among warm sites, convoluted shores (> 100 m extra length per km) 17.6 vs 7.3; bottom roughness r² 0.00, fetch
  r² 0.09; substrate not measured; territory ~18 m across [secondary — citing Scott 1993]; brood survival falls below ~15 °C
  [secondary — citing Shuter et al. 1980].
- **Saunders 2006**, MS thesis, UW–Stevens Point, four northern Wisconsin lakes (31–276 ha), 1998–2000 [primary — [MINDS@UW
  1793/81123](https://minds.wisc.edu/handle/1793/81123)]:

  | Lake | Littoral bottom | Adults/ha | Nests/km | Wood pieces/m² | Nest gravel / cobble / sand | Cover within 1.5 m: rock / wood / both / none |
  |---|---|---|---|---|---|---|
  | Big Crooked | sand | 0.6–0.8 | 3.5–4.5 | 0.05 | 75 / 19 / 5 % | 74 / 11 / 14 / 0 % |
  | Sanford | silt/organic | 4.6 | 9.6 | 0.38 | 63 / 5 / 31 % | 10 / 78 / 6 / 6 % |
  | Bear | silt/organic | 2.5 | 6.1 | 0.11 | 70 / 6 / 24 % | 0 / 100 / 0 / 0 % |
  | Pallette | sand | 10.3 | 26.6 | 0.04 | 62 / 6 / 26 % | 32 / 36 / 21 / 11 % |

  - Mean nest diameter 0.52–0.93 m; nearest-neighbour 18.6 m (densest lake) to ~40–46 m [inf, table garbled]; no nest below 3.0 m.
  - Egg survival per nest 0–100 % (failures fungused with the male present); fry per nest up to 1,900–9,570.
  - Bear Lake: **log(fry) = 2.64 + 1.91·log(nearest-log diameter)** explained 50 % of fry production; % cobble explained 14–25 % of
    egg survival (Big Crooked, Sanford); in Pallette distance to cover explained 27 % (positive slope). Nest-site quality tracked
    selection only where adults exceeded ~10/ha.
  - Sanford's resource-selection model reaches a 50 % chance of use at ~45 % gravel [inf; shape only].
- **Short 2001** [primary, above]: nests at 0.5–3.0 m with ≥ 40 % of particles 6.4–149 mm, not heavily embedded; nest substrate
  Big Crooked gravel 78 %, cobble 18.5–18.7 %, sand 1.7–2.9 %; Sanford gravel 57.7–63.2 %, cobble 5.7–23.8 %, sand 20.6–28.1 % —
  gravel chosen at ~30× its 1.9 % availability [inf]; egg → swim-up mortality **~28 %** (coarse Big Crooked) vs **~69 %** (silty
  Sanford); egg → fall age-0 mortality ~95 % and > 99 %; survival fell where nests were < 10 m apart; Sanford's best survival model
  (R² 0.47): % cobble, depth, distance to wood, male length; nests near shore lost more to wave surge.
- **Chu 2001**, MSc thesis, University of Toronto, App. B (seven central Ontario lakes; Harker 1982 and Ridgway unpublished)
  [primary — [U of T repository](https://utoronto.scholaris.ca/server/api/core/bitstreams/4beb3aaa-bf92-48ed-ab14-11f2ba6ac752/content)]:
  nests per 100 m of shore by shore substrate — sand 0.88, **sand + rock 1.18**, gravel 0.76, rock 0.88, **weed 0.24**, **litter
  (≥ 80 % organic debris, logs, sticks) 0.30**; at high density (< 40 m between nesters) mating chance 0.8–0.9 on sand and rock vs 0.5
  on pebble, gravel or vegetation [secondary — citing Wiegmann et al. 1992]; males move inshore at 13–15 °C and spawn at ~16 °C
  [secondary]; a 1998 storm with 51 km/h gusts destroyed all but three of several dozen nests in Jones Bay [secondary — citing
  Ridgway pers. comm.].
- **DFO smallmouth synopsis** (Brown et al. 2009, Can. MS Rep. Fish. Aquat. Sci.; report number not verified) [secondary]: best nests
  1–2.5 m on particles near 30 mm (citing Clark et al. 1998); nests 30–183 cm across; up to 40 % fail; ~2,000 fry from a successful
  nest; Oneida Lake bass spawned at 4.3–5.5 m because of wave action (citing Forney 1972); in silty streams coarser substrate fared
  worse because fanning cleared it less (citing Reynolds & O'Bara 1991).
- **Largemouth bass, three Wisconsin basins** — Weis & Sass 2011, *NAJFM* 31:943, [doi:10.1080/02755947.2011.633688](https://doi.org/10.1080/02755947.2011.633688)
  [primary — [WDNR reprint](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Outreach_BassNestsCWD.pdf)]: of 1,703 nests,
  **38 % within 0.5 m and 59 % within 1.25 m of structure** (of the 0.5-m ones, 41 % by logs, 35 % by boulders > 20 cm); nest
  substrate isoetid beds 68 %, sand 18 %, rock/pebble 6 %; 52–129 nests/km; wood (logs > 10 cm, > 150 cm, to 2 m depth) explained
  only 8–12 % of along-shore nest variation; rocky reefs without wood held 7–15 % of nests; Camp Lake's 41 logs/km raised to 141 by
  adding one tree per 10 m of shore.

**Crayfish**
- **Peters & Lodge 2008**, ESA abstract [snippet]: rusty-only lakes had more littoral cobble (**51 % vs 30 %**) and less
  vegetation (11 % vs 41 %) than lakes where natives persist; tethered with fish, virile crayfish suffered **8×** the rusty's
  predation on sand and **1.3×** in vegetation; without predators survival did not differ by habitat or species.
- **Butler & Stein 1985**, *Oecologia* 66:168, [doi:10.1007/BF00379851](https://doi.org/10.1007/BF00379851) [primary]: adults
  (≥ ~28 mm carapace) invulnerable to a 30-cm largemouth; young-of-year (12.5–14 mm CL) survived only in single-occupancy shelters
  **2 cm** wide; crayfish survived only with shelter [secondary — citing Medvick 1980]; they reach 50–60 % of adult size in their
  first summer.
- **Mather & Stein 1993**, *CJFAS* 50:1279, [doi:10.1139/f93-145](https://doi.org/10.1139/f93-145) [primary]: size refuge at
  ~20 % of the predator's total length [secondary — citing Stein 1977]; stream pools with 0–7 fish per 560 m² held 0–8.3
  crayfish/m², falling with fish; 5 × 2.5 × 3-cm shelters did not change juvenile survival in a lab stream.
- **Rahel & Stein 1988**, *Oecologia* 75:94 [primary — [OSU Knowledge Bank](https://kb.osu.edu/server/api/core/bitstreams/3fdbb4d6-7c80-5f24-9b60-94f63bb9fc26/content)]:
  25–30-mm-CL crayfish too large for 85–130-mm bass; ~1 in 4 under shelter by day with or without bass; rusty crayfish reach 25
  adults/m² in invaded Wisconsin lakes [secondary — citing Lorman & Magnuson 1978].
- **Maxwell 1988**, MSc thesis, Lakehead University [snippet — [Lakehead record](https://knowledgecommons.lakeheadu.ca/handle/2453/2150)]:
  young virile crayfish in 50-cm lake enclosures at 12, 40 and 160/m² on mud, sand or bare bottom: 6–15 % survival without substrate
  or cover; better growth with cover and mud; growth fell with density.
- **Savino & Miller 1991**, *J. Freshw. Ecol.* 6:161 [abstract — [USGS record](https://pubs.usgs.gov/publication/1000587)]: virile
  crayfish ate most lake-trout eggs on bare bottom, less on large rock and cobble, least on gravel; ~2 eggs or fry per crayfish per
  day on cobble.

**Small fish and crevices**
- **Rahel & Stein 1988** [primary]: johnny darters (36–54 mm) on gravel with 10 × 10-cm tiles propped to a **2.5-cm** gap (bass
  excluded, crayfish admitted). With bass and crayfish together darter activity rose to 19 % of control (bass alone: 6 %); crayfish
  evicted darters and shelter time fell; predation rose (not significantly); bass passed over motionless darters and noticed moving
  ones. The authors predict the effect is strongest in lake littorals lacking rocky substrate, where shelter is limited.

**Wood and fish**
- **Wolter 2012**, Wisconsin DNR literature review [secondary — [WDNR PDF](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Outreach_LitWoodyHabReviewWolter2012.pdf)]:
  artificial wood-like structures drew 5–10 % of a pond's bluegill while covering < 1 % of the area (citing Johnson et al. 1988),
  each structure with a fish "carrying capacity", and bluegill used smaller gaps when bass were present; Newbrey et al. 2005 recorded
  16 species on wood in one lake, with richness, diversity and abundance rising with branch complexity; prey predation was highest
  right next to wood and lower inside the refuge than at its edge (citing Sass 2006a); with added wood bass had smaller home ranges,
  moved less and stayed more in water < 2 m (citing Ahrenstorff et al. 2009); yellow perch need submerged wood or plants for egg
  strands (citing Hanchin 2003); large logs last centuries (citing Guyette & Cole 1999).
- **Saunders 2006** [primary, above]: in wood-rich silty lakes **78–100 %** of smallmouth nests lay next to wood.
- **Brown bullhead** [secondary — Wisconsin DNR PUBL-FM-706, 2008]: nests on rocky or sandy bottoms sheltered by plants, logs,
  rocks or overhanging banks, sometimes in hollow stumps or muskrat burrows.
- **Pumpkinseed** [secondary — DFO synopsis, Jordan et al.]: nests on sand or gravel < 1 m deep, 10–38 cm across, colonies to 15,
  often ringed by plants.

### Gaps
- Not obtained (blocked or search budget spent): Newbrey et al. 2005 (fish per log by branchiness), Roth et al. 2007 (CWH food-web
  model), Helmus & Sass 2008, Sass et al. 2012 (whole-lake wood addition), Everett & Ruiz 1993 (wood as a refuge, tethering),
  Kershner & Lodge 1995 and Capelli & Magnuson 1983 (crayfish density by substrate), Gotceitas & Brown 1993, Finstad et al. and
  Armstrong & Griffiths (crevice size vs fish size), Brind'Amour et al. 2005 and Benson & Magnuson 1992 (littoral fish by
  substrate), Lane, Portt & Minns 1996 (juvenile habitat associations).
- No lake measurement of survival by crevice size for small fish; no virile-crayfish density by substrate in a native soft-water
  lake.

---

## 4. Epilithon and the stony-shore invertebrate fauna

(From a second sub-researcher's report, its tags kept. Humic lakes' fewer mayflies and more chironomids, and the 5–15× richer bed
fauna under weeds, are in LIT and not repeated.)

### Takeaway
- **Algae: the mud carries more than the stones.** In lakes with > 10 % of surface light at the bed, chlorophyll on sediment
  (epipelon) was **up to 100×** that on rock or wood, and its production per m² of bed **5–10×** higher; the hard-surface film is
  thin and fast-turning and rises with water-column TP, the sediment film does not. Wood's own film adds little to small-lake
  production; its value is the organic sediment it holds (Sass 2006, §2).
- **Depth:** benthic production per m² rises down to the depth with ~30 % of surface light, then falls; waves limit the film at
  ≤ 1 m in small lakes, light below. For Hot Brook (Secchi 3.5–4 m; Kd ≈ 0.37–0.41 m⁻¹ by the repo's 1.44/Secchi (LID), up to
  ~0.85 m⁻¹ if the brown water's Kd·Secchi product is ~2–3) the 30 %-light depth is **~1.4–3.3 m** — the sand–mud transition and
  the upper mud — and the whole bed is photic (the 5.5-m hole gets ~1–13 % of surface light) [inf].
- **Benthic share of whole-lake production** in shallow, clear-to-moderately-coloured oligo-mesotrophic lakes: tens of per cent
  (81-lake mean 38 %; boreal Swedish lakes 10–97 %, falling with Kd, r = −0.95, and peaking at DOC ~8–10 mg/L); fish took **56 %**
  of their carbon from littoral algae.
- **Stony-shore fauna:** where measured on cobble, it is dense — ~16,000 ind/m² of stone surface and ~73,500/m² of the whole
  cobble bed at 1 m in oligotrophic but hard-water Lake Constance (zebra mussels present: use for mechanics, not totals). Only
  ~15 % of it sits on the exposed stone faces fish can pick (the rest in the interstices, 6.7×). A cleared stone is recolonised in
  **~1 month** (time constant ~20 days). In an oligotrophic Adirondack lake (the nearest analogue) the stone/wood surface fauna was
  the flat heptageniid mayfly ***Stenonema*** (**55 %**), crayfish 13 %, *Hyalella* 6 %, and the bottom sweeps *Hyalella* (**70 %**)
  and the isopod *Lirceus* (16 %); natural wood held more animals, families and biomass than the adjacent non-woody bed.
- **Zonation by exposure** (nine oligotrophic lakes): a wave-wash zone of coarse substrate with mayflies and stoneflies → a
  macrophyte zone (snails, caddis, odonates) → detrital fines (chironomids, oligochaetes, caddis) → deep fines with mussels.
- **Waves strip fauna:** mass detachment from **1.0–1.2 N/m²** of bottom shear, 50 % at 1.5 N/m² (orbital 19–42 cm/s), in the
  order sand > wood > stones > reeds > roots (habitat fractal dimension 1.00, 1.29, 1.34, 1.39, 1.80).
- **Fish and this fauna:** caged perch and ruffe (8–8.5 cm) on cobble ate small gammarids, benthic cladocerans and chironomids
  (87–96 %), caddis 20–22 % of ruffe diet on coarse stone; only ~1 % of zoobenthos biomass is truly available to fish (21 lakes);
  young perch and dace fed more and grew faster in wave-energetic periods (waves dislodge prey).

### Cited findings
**Periphyton by substrate, depth and colour**
- **Vadeboncoeur, Kalff, Christoffersen & Jeppesen 2006**, *J. N. Am. Benthol. Soc.* 25:379, [doi:10.1899/0887-3593(2006)25[379:SAADOV]2.0.CO;2](https://doi.org/10.1899/0887-3593(2006)25[379:SAADOV]2.0.CO;2)
  [abstract] (US, Greenland, Quebec lakes with > 10 % surface light at the bed): epipelon chlorophyll **up to 100×** that of hard
  substrata (rock, wood); epipelon production per m² **5–10×** hard-substrate periphyton; production per unit chlorophyll
  phytoplankton > epiphyton ≈ hard-substrate periphyton > epipelon; rock and wood chlorophyll rose with water-column TP, epipelon's
  did not.
- **Vadeboncoeur, Devlin, McIntyre & Vander Zanden 2014**, *Freshw. Sci.* 33:524, [doi:10.1086/676315](https://doi.org/10.1086/676315)
  [abstract] (13 oligo-mesotrophic lakes, 0.017–32,600 km²): epipelon chlorophyll generally rose with depth through the
  epilimnion; production peaked at intermediate depth in 5 lakes without photoinhibition; wave disturbance set epipelon biomass at
  **≤ 1 m** in the smaller lakes, light at > 1 m. The 2012 SFS presentation of the work [abstract — [CORE Scholar biology/603](https://corescholar.libraries.wright.edu/biology/603)]:
  production per m² rose to the depth with **30 % of surface light** and then declined; Ik fell linearly with depth; biofilm P rose
  with depth; consistent across 14 lakes.
- **Vadeboncoeur et al. 2003**, *Limnol. Oceanogr.* 48:1408 [abstract]: periphyton **80–98 %** of whole-lake primary production in
  shallow oligotrophic Greenland lakes, **5–80 %** at intermediate TP, ~0 % in Danish lakes > 100 µg TP/L. **Vadeboncoeur et al.
  2008**, *Ecology* 89:2542, [doi:10.1890/07-1058.1](https://doi.org/10.1890/07-1058.1) [abstract]: lakes ≤ 5 m mean depth are
  benthic- or pelagic-dominated by trophic state, not basin shape. **Vadeboncoeur, Vander Zanden & McIntyre 2008**, ESA talk, 81
  lakes [abstract — [CORE Scholar biology/613](https://corescholar.libraries.wright.edu/biology/613)]: benthic algae averaged **38 %**
  of whole-lake primary production; fish relied on littoral algal carbon at **56 %**.
- **Puts et al. 2022**, *Glob. Change Biol.* 28:7063, [doi:10.1111/gcb.16409](https://doi.org/10.1111/gcb.16409) [primary] (26
  shallow Swedish lakes; DOC 1.5–16.3 mg/L, Kd 0.3–4.1 m⁻¹, TP 3.9–33.9 µg/L, max depth 3.7–15.8 m): benthic share of GPP boreal
  **10–97 %**, subarctic 10–85 %, Arctic ~90 %; in boreal lakes the share fell with Kd (**r = −0.95**, n = 9) and rose with relative
  littoral area (35 % of variance); total, benthic and pelagic GPP peaked at DOC **~8–10 mg/L** (absolute GPP only in Supplement S2,
  not read).
- **Ask et al. 2009**, *Ecology*, [doi:10.1890/07-1855.1](https://doi.org/10.1890/07-1855.1) [snippet] (4 small subarctic lakes):
  the benthic habitat made **86 ± 4 %** of whole-lake new biomass.
- **Absolute epilithon (Upper Lake Constance; oligotrophic, 10 µg P/L, hard water 327 µS/cm)** — Scheifhacken 2006, PhD thesis,
  Konstanz [[KOPS PDF](http://kops.uni-konstanz.de/bitstreams/d1c7eda8-3465-4373-8952-b442d4c3d2b9/download)]: the lowest recorded
  epilithon (June–July 2003) **2.8 µg chl a/cm² (28 mg/m²)** and **0.4 mg AFDM/cm² (4 g/m²)** [secondary — Scheifhacken citing Fink
  2005]; stones at 0.2–0.4 m started at **2.8 mg AFDM/cm² (28 g/m²)** and fell to 1.8 after weeks of waves (controls 2.2), less at
  0.2 than 0.4 m [primary]; a grazer "floor" of ~0.1 mg AFDM/cm² (1 g/m²) remains under intense snail grazing [secondary —
  Scheifhacken citing Stelzer & Lamberti 2002].
- **Wood (epixylon):** grouped with rock as low-chlorophyll "hard substrata" (Vadeboncoeur 2006) [abstract]; a summary that heavily
  decayed wood carries more periphyton than fresh wood and that wood out-produced sediment in three Ontario lakes [snippet; source
  probably Smokorowski et al. 2006 or Bowen et al. 1998 — unverified]. No mg/m² values obtained.

**Stony-shore, wood and sand fauna**
- **Scheifhacken 2006** [primary, Lake Constance]: single cobbles (5–14 cm, mean 6.9) and 300-cm² test stones at ~0.5 m, exposed to
  sheltered sites: colonised stones held **479 ± 39 ind per 300 cm²** (~**16,000 ind/m² of stone surface** [inf]); bare stones
  recolonised 19–35 (day 3), 99–147 (day 7), 142–241 (day 11), 449–560 (day 31, = controls), 417–584 (day 73). Whole substrate at 1
  m (25 × 25-cm diver frame, interstices included): **4,594 ± 398 ind per 0.0625 m²** (~73,500/m², range ~14,700–303,000 [inf]) —
  small chironomids 795, Chironominae 524, the stone-cased caddis *Tinodes waeneri* 298, the mayfly *Caenis* 105, oligochaetes 100,
  *Gammarus* 57 per frame; in-substrate fauna **6.7×** the exposed stone surface's (so ~15 % accessible to surface-picking fish
  [inf]). Hard water with *Dreissena* (which dominated biomass in another chapter).
- **Woo et al. 2025**, *Hydrobiologia* 853:701, [doi:10.1007/s10750-025-05958-3](https://doi.org/10.1007/s10750-025-05958-3)
  [primary] (Little Moose Lake, Adirondacks; oligotrophic, 271 ha, Secchi 6–9 m; wood, sand, silted rock, clean cobble):
  abundance, family richness and biomass higher on natural wood and on wooden boat ramps than on adjacent non-woody bed (wood =
  ramps); Hester-Dendy samplers (1,032 cm²): ***Stenonema* (Heptageniidae) 55 %**, *Faxonius propinquus* 13 %, *Hyalella* 6 %,
  Perlidae 4 % (natural wood only), Coenagrionidae 4 %; bottom sweeps ***Hyalella* 70 %**, ***Lirceus* 16 %**, Crangonyctidae and
  Sphaeriidae ~2 % each; no per-m² densities; "unaltered forested north-temperate lakes hold 150–475 logs per km" [secondary — Woo
  citing Marburg et al. 2006].
- **Weatherhead & James 2001**, *Hydrobiologia* 462:115, [doi:10.1023/A:1013178016080](https://doi.org/10.1023/A:1013178016080)
  [abstract] (nine mostly oligotrophic New Zealand lakes): the wave-wash/coarse → macrophyte → detrital-fines → deep-fines zonation
  above; mayflies with coarse substrate; detritus biomass negatively related to mayflies and stoneflies.
- **Brauns 2009**, PhD thesis, Humboldt-Universität Berlin, [doi:10.18452/15947](https://doi.org/10.18452/15947) [primary] (NE
  German lowland lakes): whole-lake littoral (< 1.2 m) density **2,184–9,148** (presumably ind/m²; 2,184 in oligo-mesotrophic
  Werbellinsee); stone communities structured by wind exposure, wood and root communities by TP and conductivity; flume detachment
  as in the Takeaway.

**Fish feeding**
- **Scheifhacken 2006**, ch. 4 [primary]: perch 8.5 cm and ruffe 8.0 cm caged at 1 m on sheltered cobble and exposed coarse stone:
  gammarids + benthic cladocerans + chironomids **87–96 %** of the diet; caddis **20–22 %** of ruffe diet on coarse stone; small insect
  larvae avoided (Strauss index −0.21 to −0.59); perch stomachs emptier when caged with ruffe. ~**1 %** of zoobenthos biomass truly
  available to fish; in 21 temperate lakes fish consumption in the upper 5 m was below benthic P/B [secondary — Scheifhacken citing
  Boisclair & Leggett 1985].
- **Stoll, Hofmann & Fischer 2010**, *J. Fish Biol.* 76:1714, [doi:10.1111/j.1095-8649.2010.02611.x](https://doi.org/10.1111/j.1095-8649.2010.02611.x)
  [abstract]: gut contents of young-of-year perch and dace rose with wave-induced energy flux; perch grew faster in high-energy periods.

### Gaps
- Rasmussen 1988 (littoral zoobenthos biomass vs substrate and slope), Bowen et al. 1998 and Smokorowski et al. 2006 (wood biofilm
  and fauna in Canadian oligotrophic lakes) and Vadeboncoeur 2006's full text were not obtained (403); the jyx.jyu.fi copies of
  Vesterinen et al. 2016 (humic-lake periphyton) and a Finnish littoral-biomass study returned 503 — worth a retry.
- No soft-water, coloured-lake measure of stony-shore fauna per m²; no Maine data at all.

---

## 5. Leaf packs and litter on the bed near shore

(LLS §2 holds litterfall per m² of forest, "most within 10 m of shore", stream and Coweeta decay rates, the first-24-h leaching,
chironomids colonising packs within 2 days, and the Scott Lake k values; not repeated.)

### Takeaway
- **Where leaves end up depends on exposure.** On a wave-exposed shore leaves broke down **~6×** faster (beech k 0.0065/d vs
  0.0011/d on a sheltered shore) and storms with 0.55–0.64-m waves stripped fragments, fine organic matter and their animals:
  erosional shores give fast physical loss and little deposit; depositional coves give slow, biological decay. In Hot Brook terms
  [inf]: leaves falling on the wave-worked rock/sand band (§1) are broken and swept to the mud line and the coves; packs persist
  on the organic wetland shores and below ~1.5–2 m.
- **How much:** airborne litter can reach **~500 g C per m of shoreline per year** (Gasith & Hasler 1976) and **1,111 g C/m/yr** on
  a beech shore (Lake Stechlin, Casper 1987), raising upper-littoral sedimentation from 30 to **152 mg C m⁻² d⁻¹** — i.e. up to
  **~1–2.5 kg dry per m of shore per year** [inf, at ~45 % C]. That is above LLS's "4 to several hundred g/m/yr" range; it is a
  deciduous-forest maximum, and Hot Brook's spruce–fir shores (needles, less overhang) should sit lower, its alder–red maple
  wetland shores nearer it [inf].
- **Packs are habitat more than food, but they are productive habitat:** in a woodland pond, 1 m² of bed processed ~280 g dry of
  oak litter a year (32 % left after a year, k ≈ 0.003/d), shredders took only 11 %, and the litter fauna (**~51,000 ind, 3.5 g
  dry**) produced **~65 g dry/m²/yr**, 81 % of it chironomids — more than *Typha* stems or *Chara* as a substrate. In lakes the
  litter-bag fauna was mostly Orthocladiinae; shredders were unimportant on the exposed shore. Isopods (*Lirceus*/*Caecidotea*)
  and *Hyalella* are the regional litter crustaceans (Little Moose Lake sweeps, §4).
- **No standing stock** of leaves (g/m²) by depth or distance from shore was found for any lake.

### Cited findings
- **Pabst, Scheifhacken, Hesselschwerdt & Wantzen 2008**, *Hydrobiologia* 613:117, [doi:10.1007/s10750-008-9477-y](https://doi.org/10.1007/s10750-008-9477-y)
  [primary — [KOPS PDF](http://kops.uni-konstanz.de/bitstreams/59bb0e95-9849-4c34-9ebe-149f53bc9011/download)] (Lake Constance,
  wave-exposed shore, water 3.1–13.6 °C, February–May): k **0.0065/d beech**, **0.0089/d poplar**; sheltered Lake Stechlin beech
  **0.0011/d** [secondary — Pabst citing Casper 1987]; first-24-h leaching poplar 16 %, beech 5 %; shredders unimportant, litter-bag
  fauna mostly Orthocladiinae; storms (0.55–0.64-m waves) stripped leaf fragments, FPOM and invertebrates. Supply [secondary —
  Pabst citing the named sources]: Gasith & Hasler 1976 — airborne litter ~10 % of the organic-C budget of oligotrophic and small
  eutrophic lakes, > 80 % of it leaves, up to ~500 g C per m of shoreline per year; Casper 1987 (Lake Stechlin, beech shore) — 1,111
  g C/m/yr, settling mostly in the upper littoral and raising its sedimentation from 30 to 152 mg C m⁻² d⁻¹.
- **Oertli 1993**, *Oecologia* 96:466, [doi:10.1007/BF00320503](https://doi.org/10.1007/BF00320503) [abstract] (woodland pond,
  Geneva; per m² of pond bottom): **5,641 kJ** of oak litter processed (~280 g dry at ~20 kJ/g [inf]); leaching 8.5 % in 6 days;
  **32 %** left after 1 year (k ≈ 0.0031/d [inf]); 11.2 % processed by shredders; litter fauna **51,374 ind**, **3.53 g DM**,
  production **1,451 kJ** (~65 g [inf]), chironomids 1,180 kJ (~81 % [inf]); predators 39 % of biomass but 12 % of production; leaf
  litter out-produced *Typha* stems and *Chara* as a substrate.

### Gaps
- No lake measurement of coarse organic matter standing stock (g/m²) against depth or distance from shore, nor of isopods or
  *Hyalella* per gram of leaf in lake packs; no conifer-needle litter study in a lake littoral.

---

## What the sim should model [inf]

All of this is design suggestion, built from the findings above; none of it is measured at Hot Brook.

### (a) Build the substrate map offline, as generated data
- **Where:** a new step in `tools/hotbrook` (beside `shallows.py`), writing per-cell substrate fractions into the generated
  `hotbrook3d.js` (and the 1/10 world's) — e.g. `sub_rock`, `sub_grav`, `sub_sand`, `sub_org` as Uint8 (×255), mud the remainder,
  plus `wood` (logs/100 m² or a structure index). Static and derived from geometry, so it adds no sim state, no save field and no
  `core.rand` draw; the gate can check its shares.
- **Rule** (the §1 table, which reproduces both Håkanson's 21–24 % and the ELA/Sanford proportions):
  1. Per cell, maximum fetch Fmax over 36 directions (weight by the wind rose if one is added); critical wave base
     **Zc = 0.77 × 1.66·√Fmax(km)** m (median ~1.8 m here, 1.5–2.3 by exposure).
  2. r = bed depth / Zc. r < 0.35 → boulder–cobble 0.6, gravel 0.3, sand 0.1; 0.35–0.6 → cobble 0.3, gravel 0.3, sand 0.4;
     0.6–0.8 → gravel 0.2, sand 0.7, mud 0.1; 0.8–1 → sand 0.4, mud 0.4, organic 0.2; r ≥ 1 → mud (gyttja). Blend smoothly
     across band edges rather than step.
  3. **Shore overrides:** water within ~50 m of a wetland-class shore (woody/shrub/emergent wetland) and above Zc → organic muck
     (6–8 % of each lake); Upper's NE beach → sand to ~1.5 m; the camp shore → +sand, −wood (Deeds 2023: sand rises with
     disturbance); the brook → cobble riffles, sand and wood in the runs, the 1.1-m pool's bed mixed (FIELD photos).
  4. Optional refinements: NAIP's bright-bottom excess E0 (LID) as a texture hint (bright = sand, mottled = cobble, dark nearshore =
     organic); Cooley's sheltered-bay test (mean fetch < 150 m → depositional) for small coves the 15-m test missed.
- **Checks** (gate or tool printout): hard (rock + gravel) **6–8 %** of each lake (the rule above gives 6.3 % / 7.7 % [inf]); sand + mixed 8–15 %; mud + organic **75–80 %**;
  erosion/transport (r < 1) 21–25 %; ≥ 50 % of shore cells with a stony waterline; the mud line's median depth 1.6–2.0 m.

### (b) Coarse woody debris as placed logs
- Place discrete logs (not just a band index): along upland (forest) shore at **150–500 logs ≥ 10 cm per km**, halved on the
  long-fetch N and S shores, **≤ 50–150/km** on wetland shores (mostly alder stems), **30–100/km** on Upper's camp shore; Poisson-
  clustered (most 50-m stretches empty or rich; Marburg 61 % occupied, 20–4,200/km where present), more in lee coves.
- Geometry: whole conifers 10–40 cm, 5–20 m long, root wad on the bank, crown in 0.5–2 m (≤ 2.5 m = `WOOD_Z`, within ~15 m =
  `WOOD_W`); about a third to half with a part above water (SGV §6) — basking for turtles, perches for kingfishers.
- Static with slow additions (windthrow years: a few logs/km/yr) — residence decades to centuries. Placement uses a tool-time RNG,
  not `core.rand`.
- The renderer can draw them from the same data (the far-shore and photo layers already exist).

### (c) Consequences to wire, one slice at a time
1. **Crayfish shelter (littoral3 `Kcr`)**: replace `z < CR_ROCK_Z` with the cell's rock + gravel fractions (crevices) plus wood:
   K = CR_ROCK·(f_rock + ½ f_grav) + CR_WOOD·wood + weeds + CR_MUD·f_mud. The rocky area falls from ~19–20 % of the lake (today's
   proxy) to ~6–8 %, cutting whole-lake crayfish toward the user's "not common". Keep the size refuge (≥ 28 mm CL safe from 30-cm
   bass; ~20 % of predator length) and the young's need for ~2-cm crevices.
2. **Fish cover (fish3 `rockC`)**: crevice cover from f_rock (not depth); wood cover from the log map (bass station-holding
   ×4–5 at rest, SHH (c); perch and sunfish edge use; predation highest at the wood's edge, lower inside).
3. **Smallmouth nests**: candidate cells need gravel + cobble ≥ ~0.4 at 0.5–2.5 m; prefer cells within 1.5 m of a log or a boulder
   (Saunders: 89–100 % of nests by cover); success by substrate — egg → swim-up mortality ~28 % on coarse vs ~69 % on silt — and by
   exposure (storm surge loses shallow, exposed nests; 51-km/h gusts wrecked most nests in a bay); density checks **3–30 nests per
   km** of suitable shore, warm convoluted shores more. Pumpkinseed/redbreast colonies on sand or gravel < 1 m; bullhead nests in
   cavities (logs, boulders, banks); yellow perch strands on wood and plants (plants3 SPAWN already carries `wood`).
4. **Mussels (littoral3 `MU_*`)**: capacity by substrate instead of depth bands — firm sand/gravel and sand–mud mixes high, the
   wave-scoured cobble lag low, semi-liquid gyttja low (eastern floater the exception).
5. **Bed fauna**: worms and chironomids on mud (today's `benth`); a stony-shore guild on rock/gravel (heptageniid mayflies,
   *Hyalella*, isopods, caddis, snails) with its own capacity, ~85 % of it in the interstices out of fish reach, recolonising in
   ~1 month after a storm; waves detach fauna above ~1 N/m² of bottom shear (sand first, stones and roots last); leaf packs raise
   capacity locally (below).
6. **Periphyton (chem3 `PERI_*`, sedOM)**: per substrate — epipelon on mud/sand thick and slow (5–10× the per-m² production of the
   stone film), epilithon on rock thin, fast, TP-tracking and grazed to a ~1 g AFDM/m² floor, wave-limited at ≤ 1 m; peak benthic
   production per m² near the 30 %-light depth (~1.4–3.3 m here).
7. **Sediment focusing (chem3 `sedOM`, P binding, O₂ demand)**: the organic layer accumulates only where r ≥ 1; above it,
   storm resuspension moves organic matter and its P down-slope to the mud line. This puts ~3/4 of the bed's organic matter, P
   release and under-ice O₂ demand on the gyttja, and keeps the rock band clean. Wind resuspension (turbidity) only from fine
   substrate above Zc.
8. **Leaf packs**: the October leaf pulse (LLS) lands within ~10 m of forested and wetland banks, is broken ~6× faster on the
   wave-worked band than in sheltered water, drifts to the coves and below Zc, and raises isopod/amphipod/chironomid capacity where it
   lies (~65 g dry fauna production per m² per year under a full litter layer, pond value).

### (d) Order and validation
- Order: (a) map + checks → (c1) crayfish → (c2) fish cover → (c3) nests → (c7) sediment focusing → the rest. Each a ≥ 3-seed A/B
  where it moves populations (the working agreement), with the young-of-year fate audit for (c2)–(c3).
- Field checks for the user, if they want to help: at a dozen shore points, the substrate class every metre out to chest depth and
  the depth where the bottom turns to soft dark mud; logs per 100 m along a few stretches of each shore type.

---

## Access log

No block was bypassed; no alternate copy was sought for a blocked source; no email address was given to any service; no PDF was
saved into the repo (the fetch tool cached some PDFs in the session's tool-results folder; text was extracted with `pdftotext`
into the scratchpad).

**Read in full (by me):** Cooley 1997 thesis (MSpace, U. Manitoba; text layer); Mackay et al. 2012 postprint (NORA); USBR Salton
Sea App. 1G; Terasmaa 2005 (kirj.ee); Marburg et al. 2006 and Sass et al. 2006 (WDNR PDFs); Deeds et al. 2023 (PMC, served
normally this time); the EPA NARS data page and the NLA 2007 PHab metrics metadata; the Christensen 1996 abstract
(urbanforestrysouth). The sim's own `src/w3/true/hotbrook3d.js` (fetch, wave-base and shore-type computations, scripts in the
scratchpad: `fetch_ebd.py`, `substrate_rule.py`, `shore_types.py`).

**Read in full (sub-researchers):** Rejwan et al. 1997, 1999 (harkness.ca); Saunders 2006 and Short 2001 theses (MINDS@UW); Chu
2001 thesis (U of T); Weis & Sass 2011 and Wolter 2012 (WDNR); Rahel & Stein 1988 (OSU Knowledge Bank); Butler & Stein 1985 and
Mather & Stein 1993 (copies cached earlier in the session); Scheifhacken 2006 and Pabst et al. 2008 (KOPS); Puts et al. 2022; Woo
et al. 2025; Brauns 2009 (HU Berlin).

**Blocked or failed (not circumvented):**
- 403: cdnsciencepub.com (Rowan et al. 1992; Rasmussen 1988; Newbrey 2005; Guyette & Cole 1999), agupubs/Wiley (Håkanson 1982),
  tandfonline (Kaufmann et al. 2014 NLA littoral paper), maine.gov MDIFW and MGS pages (Baskahegan Lake survey sheet; MGS till
  fact page), esajournals/aslopubs (Garvey 2003, Brind'Amour 2005, Vadeboncoeur 2003), journals.uchicago.edu (Kershner & Lodge
  1995; Freshwater Science 2014), sciencedirect (Roth 2007), jvzlab.limnology.wisc.edu (Capelli & Magnuson 1983), CORE Scholar PDF
  (Vadeboncoeur 2006), hindawi, edepositireland, ouci.dntb.gov.ua.
- Sign-in or cookie steps not followed: link.springer.com (idp redirect: the J. Paleolimnol. mud-DBD paper, Everett & Ruiz 1993,
  Rahel & Stein, Gotceitas & Brown, Sass 2012); gis.maine.gov `mgs` folder ("Sign In"); publications.gc.ca archived-content gate
  (DFO Tech. Rep. 2276).
- Too large: USGS WRI 80-69 (43 Maine lakes) exceeded the fetch limit (10 MB).
- Down or missing: jyx.jyu.fi (503; Vesterinen et al. 2016, a Finnish littoral-biomass study), helda.helsinki.fi, Lakehead
  knowledge commons (500/404), CSIRO MF08260 (404), eco.confex.com.
- Not downloaded by choice: the NLA 2007/2012/2017 PHab and site CSVs (MB-sized; a download needs the user's go-ahead) — the most
  direct route to Maine's own littoral substrate and snag cover (§1 Gaps).
