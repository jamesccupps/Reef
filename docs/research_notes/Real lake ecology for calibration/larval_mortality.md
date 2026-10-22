# Field mortality of fish larvae (swim-up / first feeding → ~20–30 mm) in small north-temperate lakes

Compiled 2026-10-21 for the Hot Brook lakes (two shallow soft-water mesotrophic lakes in eastern Maine, mean depth ~3 m, 280–375 ha).

**Why this note exists.**
- The sim now has an egg stage with field hatch rates.
- Its larval background mortality was set before the egg stage: 2-D `FRY.M_LARVA` 0.08/d and 3-D `M_LARVA3` 0.04/d at 1 cm, both ∝ 1/length, so ~0.08/d at swim-up in 3-D.
- The larvae now reach ~50–160 per m² of lake and strip the zooplankton.

**Tags.**
- **[primary]**: read in the paper body.
- **[abstract]**: read in the abstract.
- **[secondary]**: cited by another source, which is named.
- **[snippet]**: from a search summary only.
- **[inf]**: my inference or arithmetic.
- **†**: read in this session by a sub-researcher, not re-read by me.

**Units and conventions.**
- Z is the instantaneous total mortality rate per day, Z = ln(N₀/N_t)/t. Survival S over t days is e^(−Zt).
- "Per mm" rates are mortality per mm of growth: Z/day = z_mm × growth (mm/d).
- Densities per m³ become per m² of lake by multiplying by the column depth. I use 3 m for Hot Brook [inf].

**Overlap with existing notes.** Read with:
- `fish_zooplankton_coupling.md` §2: Oneida perch Z 0.042; Houde 1989 and 2008; Pelican Lake; critical-period evidence.
- `forage_fish_early_life.md`: bluegill and perch early life; Oneida densities.
- `../Whole lake 3D fish simulation/egg_stage.md`: egg survival by species.
- `../Whole lake 3D fish simulation/littoral_invertebrates.md`: odonates.
- `first_winter_mortality.md`.

This note adds, from data not in those notes:
- the walleye larval Z table;
- the Hudson white perch cohort Z values;
- Eurasian perch Z in two Scottish lochs;
- alewife-driven perch Z;
- the Pepin 2016 size slopes;
- the invertebrate-predator evidence;
- the centrarchid and esocid survival data.

---

## 1. Takeaway table

| Species (proxy) | Z (/day) or survival | Stage / length | Place (lake type) | Method | Source | Tag |
|---|---|---|---|---|---|---|
| Yellow perch | **0.042 ± 0.005** (9 yr); not density-dependent | 8 → 18 mm | Oneida L., NY (20,700 ha, eutrophic) | Annual larval surveys | Irwin et al. 2009, TAFS 138:99 | [secondary: `fish_zooplankton_coupling.md`] |
| Yellow perch | **0.22–0.28** (no alewife, 3 yr); **1.58** with alewife (North Pond 1985) | Larvae | Two embayment ponds, L. Ontario | Field cohort decline + predation model | Mason & Brandt 1996, CJFAS 53:1609, doi:10.1139/f96-076 | [abstract] |
| Yellow perch | **0.15–0.52**, falling with zooplankton biomass and temperature | Larvae 5–24 d old | Pelican L., NE (332 ha, shallow) | Otolith cohorts, 2004–12 | Kaemingk et al. 2014, TAFS 143:845 | [secondary: `forage_fish_early_life.md`] |
| Yellow perch | Egg → 8 mm survival **1.6–18.4 %**, with 80+ % "base mortality" every year | Egg → 8 mm | Oneida L. | Egg production vs larval survey | Clady 1976, JFRBC 33:1887 | [abstract] |
| Eurasian perch | **0.063 mean (0.020–0.089)**; 0+ juveniles 0.021. Most larval loss was cannibalism by adults; food did not limit survival | Larvae; 0+ juveniles | Lochs Kinord and Davan, Scotland | High-speed plankton sampler, exponential decline | Treasurer 1989, J. Fish Biol. 34:913, doi:10.1111/j.1095-8649.1989.tb03374.x | [abstract] |
| White perch | 6-d cohorts: **0.785, 0.509, 0.328, 0.241, 0.304, 0.187, 0.044, 0.137**. Fell through the season as water warmed 12 → 21 °C | Post-hatch larvae (growth 0.212 mm/d) | Hudson R. tidal fresh water, 1994 | Cohort catch curves | Limburg et al. 1999, Fish. Bull. 97:80 | [primary] |
| White perch | 0.03–0.08 | Larvae, first 45 d | Patuxent R., MD | Otolith cohorts | Kerr 2008 | [secondary: `larval_juvenile_energetics_panfish.md` §8] |
| Walleye (lake proxy) | **0.20–0.25**; **0.21–0.30**; **0.35** (ten lakes); **0.067–0.26** | 10–18 mm; stocking → 9–10 mm; 8–16 d after stocking; stocking → 20–30 d | Oneida L. bay (Noble 1972); Oneida (Forney 1975); ten NY lakes; Rathbun L., IA (Mitzner 1992) | Larval tows | Johnston 1995 PhD (U. Manitoba), Table 2.1 | [primary] for the table; [secondary] for each study |
| Walleye, **no fish predators** | **0.016–0.028**; **0.012–0.046**; 0.0055–0.087; but **0.134** in the year piscine predators got in | 9.3–30 mm over 50 d (1,000-m³ enclosures in L. St. George, ON); stocking → 41–100 mm (ponds) | Enclosures, culture ponds | Census | Te Brugge & McQueen 1991; Johnston et al. 1992; Fox 1989; Johnston 1995 | [primary] (Johnston table) |
| Bluegill | **0.109–0.385** for days 0–4 after dispersal, then **0.001–0.008** to fall. Dispersal → fall survival 10–58 % | 5 mm swim-up → fall | Camp and Lamereau lakes, WI (4 ha, soft water, bluegill only) | Whole-lake estimates | Beard 1982, WDNR Tech. Bull. 127, Table 11 | [primary] |
| Bluegill / pumpkinseed / largemouth bass, **with piscivores** | Fry → 12 Sept survival 0.097 % / 0.24 % / 0.25 % (1941 year classes). Z ≈ 0.10 / 0.07 / 0.06 [inf] | Nest fry → September | Deep L., MI (6 ha) | Rotenone recovery (biased low) | Carbine 1948, MI IFR Rep. 1166 | [primary] (spot-checked) †; Z [inf] |
| Bluegill | Z per mm of growth 0.18–1.27; density-dependent (r 0.90 in one pond); peak >360/m³ | 6–13 mm | Two Alabama impoundments | Otolith cohorts | Partridge & DeVries 1999, TAFS 128:625 | [abstract] + [secondary] |
| Smallmouth bass | Daily survival 0.90 for embryos (Z 0.105) and 0.92 for larvae (Z 0.083) | Under the guarding male | L. Opeongo, ON / L. Erie | Model parameters from field data | Steinhart et al. 2008, Evol. Ecol. Res. 10:351 | [primary] † |
| Smallmouth bass | Daily loss **6.7 % / 14.0 % / 9.1 %** (Z 0.07 / 0.15 / 0.095) | Egg → swim-up / swim-up → metamorphosis / → juvenile | North Anna R., VA | Daily brood counts | Knotek 1995 MS; Knotek & Orth 1998, EBF 51:285 | [abstract] † |
| Smallmouth bass | Egg potential → fall YOY **0.1–0.5 %** (1979–81) and 0.27–1.4 % (1982–85). Pre-dispersal → fall Z 0.023–0.047 | Egg → fall (~64 mm) | Nebish L., WI (38 ha, seepage) | Whole-lake egg census + Schnabel | Serns 1984, TAFS 113:304; Raffetto et al. 1990, *Ecology* 71:1523 + Engel et al. 1999 | [abstract] (Serns); [primary] † (Raffetto) |
| Northern pike (pickerel proxy) | Egg → fingerling **0.15–2.69 % (mean 1.09 %)** → Z ≈ 0.066–0.118 (mean 0.082) | Egg → 38–173 mm, ~55 d | Managed marshes, WI | Drain counts | Fago 1977, WDNR Tech. Bull. 96 | [primary] †; Z [inf] |
| Northern pike | Yolk-sac → December survival 0.059–11.25 % (Z ≈ 0.010–0.035); density-dependent from late June; cannibalism from 5.45/m² | Yolk-sac → December | Ponds, UK | Stocking | Wright & Giles 1987, J. Fish Biol. 30:617 | [abstract] †; Z [inf] |
| Cyprinids (dace, fallfish, killifish proxy) | Daily survival 0.920–0.964 → **Z 0.037–0.083** (mean 0.058) | Age-0, first summer | Canadian and Brazos rivers, TX | Otolith catch curves | Wilde & Durham 2008, TAFS 137:830 | [abstract] †; Z [inf] |
| All freshwater larvae (mean) | **5.30 %** survive to metamorphosis (marine 0.12 %). That implies mean Z ≈ 0.10–0.12/d over a 25–30-d stage [inf] | Hatch → metamorphosis | Compilation | Meta-analysis | Houde 1994, ICES J. Mar. Sci. 51:91 | [abstract] |

**The one-line answer [inf]:**
- **Lakes with fish:** larvae of 5–20 mm die at **Z ≈ 0.05–0.3/day**. Medians are roughly 0.06 (Eurasian perch), 0.2–0.25 (walleye, white perch, Pelican Lake perch) and 0.04 (Oneida perch, at the low end).
- **Fish predators excluded:** larvae of 9–30 mm die at only **0.01–0.05/day** (walleye enclosures and ponds; Beard's bluegill after day 4).
- **So the gap is fish predation.** It accounts for most larval mortality in lakes.
- **Invertebrates:** they add a hazard on larvae under ~8 mm (cyclopoids) and at sunfish colonies in weed (*Hydra*). Nowhere was a lake shown where they dominate.

---

## 2. Findings by question

### Q1. Instantaneous daily mortality and stage survival

**General syntheses**
- **Houde 1994** (ICES J. Mar. Sci. 51:91–97, doi:10.1006/jmsc.1994.1008) [abstract]:
  - after temperature correction, freshwater larvae have lower mortality, lower metabolic needs and shorter larval stages than marine larvae, with similar growth;
  - predicted mean survival to metamorphosis is **5.30 % freshwater vs 0.12 % marine** (44×);
  - hence juvenile dynamics matter relatively more for freshwater recruitment.
  - Freshwater mean Z and D were not in the abstract, and the full text (OUP subscription; the EPA copy now redirects) was not read. Cumulative Z = ln(1/0.053) = **2.94** [inf]; over a 25–30-d stage that is ≈ 0.10–0.12/d [inf].
- **Houde 1989** (Fish. Bull. 87:471, marine, 22 species) [secondary: `fish_zooplankton_coupling.md`]:
  - Z = 0.0256 + 0.0123·T → 0.15 / 0.27 / 0.40 d⁻¹ at 10 / 20 / 30 °C;
  - that is a Q10 of ~1.8 for 10 → 20 °C [inf].
- **Pepin 1991** (CJFAS 48:503, doi:10.1139/f91-065) [abstract]:
  - daily mortality of eggs, yolk-sac larvae and postlarvae rises with temperature;
  - **postlarval daily mortality falls with mean length**;
  - **stage-specific (length-dependent) cumulative mortality of postlarvae is independent of temperature**, because temperature speeds daily growth and daily mortality equally.
  - So mortality per mm grown is temperature-free [inf from the abstract]. Coefficients not obtained.
- **Pepin 2016** ("Death from near and far", ICES J. Mar. Sci. 73:196) [primary text via WebFetch; marine coastal Newfoundland, 3–20 mm]:
  - catch-curve Z: ln Z = 0.163 − 1.49·ln L (r² 0.30), a ~96 % fall in the mean rate from 3 to 20 mm. Units are per day (t from length-at-age) [inf on units]. That gives **≈0.11 at 5 mm, 0.038 at 10 mm, 0.014 at 20 mm** [inf].
  - Vertical life table, per 1-mm interval: ln Z_R = −0.269 − 0.391·ln L (r² 0.026). That gives **0.41/mm at 5 mm, 0.31 at 10 mm, 0.24 at 20 mm** [inf].
  - Temperature was not significant in either.
- **Miller et al. 1988** (CJFAS 45:1657, doi:10.1139/f88-197) [abstract]: in regressions over 72 marine and freshwater species, body size unifies feeding, starvation, swimming and predation risk. Their mortality–size coefficients were not obtained.
- **Size-dependent IBMs** [abstract]:
  - in Letcher, Rice & Crowder 1996 (CJFAS 53:787, doi:10.1139/f95-241), predator size explained 83 % of the variance in larval survival, while proportional changes in prey had minor effects;
  - in Rice, Miller & Rose 1993 (CJFAS 50:133), small changes in mean growth changed 60-d survival 10–30-fold under size-dependent predation.
- **Houde 2008** (J. Northw. Atl. Fish. Sci. 41:53) [primary text via WebFetch]: predation is the principal proximal agent; cohorts lose biomass while M/G > 1. No freshwater Z values.
- **Lorenzen 1996** (J. Fish Biol. 49:627) [snippet]: M = 3.00·W^−0.288 per year (W g wet) for juveniles and adults in natural ecosystems. That is ≈0.06/d at 1 mg and 0.03/d at 10 mg [inf]. It is fitted on juveniles and adults, so it underestimates larvae.

**Yellow perch and Eurasian perch**
- Oneida 8 → 18 mm: Z 0.042 ± 0.005, density-independent; 18 mm → fall ≈ 0.035 (~1.3 % survive). See `fish_zooplankton_coupling.md` [secondary].
  - At 0.48 mm/d that is **0.088 per mm**, so ~42 % survive 8 → 18 mm [inf].
  - Oneida is a large lake whose larvae are pelagic over deep water. It is the **low** end of the field range [inf].
- Lake Ontario embayment ponds (North and South Pond, 1984–86) [abstract]:
  - yellow perch larval Z was **0.22–0.28** in South Pond (no alewife) in all 3 years;
  - it was **1.58** in North Pond in 1985, coinciding with the highest alewife abundance;
  - temperature, wind and food did not explain the high rate, and a predation model showed alewife predation sufficed.
  - In 1984 alewives entered 3 weeks after the perch hatch peak and no predation occurred. (Mason & Brandt 1996)
- Pelican Lake, NE: Z 0.15–0.52, inversely related to total zooplankton biomass and temperature; two bottlenecks, post-hatch and old-larva [secondary]. The full text sits behind a Cloudflare check at digitalcommons.unl.edu, which I did not bypass.
- Oneida egg → 8 mm: 1.6–18.4 % survival, 80+ % base mortality. Temperature (+) and wind (−) explained 87 % (Clady 1976) [abstract].
- Lake Michigan: alewife predation is probably not important for larval perch at present, because the vulnerable size window is narrow and open-lake larval density is low. It is more likely important "in smaller, more productive systems where other predators are abundant" (Fulford et al. 2006, CJFAS 63:11) [snippet].
- **Eurasian perch, two Scottish lochs** (Treasurer 1989) [abstract]:
  - larval Z **0.063/d mean (0.020–0.089)**; 0+ juveniles 0.021/d;
  - cannibalism by adults accounted for most larval mortality; pike and adult perch took most juveniles;
  - food on transition to exogenous feeding did not limit survival;
  - year classes in L. Davan were twice eliminated in the first summer; poor eleutheroembryo survival was blamed on turbulence on exposed shallow spawning areas.
- **Perch larval piscivory** (Brabrand 2001, EFF 10:97) [abstract]:
  - Eurasian perch can eat newly hatched roach, bream and smaller siblings from **10.3 mm**, at ~0.5 prey per perch per h at 21 °C;
  - largest prey length = 0.478·L_pred + 1.829 mm (perch 10–62 mm).
  - So early-hatched perch larvae are predators of later-hatched larvae [inf].
- Lake St. George, ON (10 ha) [abstract]:
  - perch larvae are offshore day and night early on;
  - larger larvae migrate inshore by day and offshore at dusk;
  - by ~30 mm they are nearshore day and night (Post & McQueen 1988, CJFAS 45:1820).

**White perch** (Hudson River, New Hamburg, 1994; Limburg et al. 1999, Fish. Bull. 97:80–91, Table 2) [primary]:
- Cohort Z by hatch period:
  - 1–6 May: 0.785 (n = 2);
  - 7–12 May: 0.509 ± 0.138;
  - 13–18 May: 0.328 ± 0.064;
  - 18–24 May: 0.241 ± 0.064;
  - 25–30 May: 0.304 ± 0.051;
  - 31 May–5 June: 0.187 ± 0.049;
  - 6–11 June: 0.044 ± 0.087;
  - 12–17 June: 0.137 (n = 2).
- Water warmed linearly from 12.2 to ~21 °C over these cohorts, and **white perch Z declined with time and temperature**.
- Growth: G_WP = 0.136 + 4.64×10⁻⁴·(zooplankton/L), r² 0.96. Length growth 0.212 ± 0.101 mm/d.
- Initial densities ln(N₀) per 1000 m³ were 5.8–12.5, i.e. ~0.3 to ~265 larvae/m³ [inf].
- The authors caution that per-cohort Z rests on a few samples.
- The median of these cohorts is ~0.27/d [inf]. At 0.21 mm/d that is **~1.3 per mm**, the highest per-mm rate in this note [inf]. That fits white perch's tiny hatch (2.5 mm SL) and slow growth (`larval_juvenile_energetics_panfish.md` §8).
- Patuxent: 0.03–0.08/d (Kerr 2008) [secondary]. Houde et al. 1990 is cited as 9 % per day (survival or mortality unclear; not converted) [snippet].

**Walleye (Johnston 1995, U. Manitoba PhD thesis, Table 2.1, "instantaneous mortality rates, z, of walleye larvae")** [primary]:
- **In lakes:**
  - Oneida Billington Bay 1966–67 (initial ~1 larva/m³, mostly hatchery): **0.20–0.25** at 10–18 mm (Noble 1972, TAFS 101:720). Noble reported 95–96 % postlarval mortality.
  - Oneida 1968–72 (0.03–0.05/m³): **0.21–0.30**, stocking → 9–10 mm (Forney).
  - Ten NY lakes (0.012/m³): **0.35** over 8–16 d after stocking.
  - Rathbun L., IA (0.03–0.04/m³): **0.067–0.26** to 20–30 d (Mitzner 1992).
- **No fish predators:**
  - L. St. George enclosures, 1,000 m³ at 8–32 larvae/m³: **0.016–0.028** over 9.3–30 mm, 50 d (Te Brugge & McQueen 1991).
  - Culture ponds:
    - Fox 1989: 0.0055–0.087 to 46 mm;
    - Johnston et al. 1992: 0.022, 0.037, 0.016, 0.046 to 41–100 mm;
    - Johnston 1995: 0.026 (1988) and 0.012 (1989) to 12 mm, but **0.134** in 1987 when piscine predators were present.
- **Johnston's conclusions:**
  - Lake rates are "an order of magnitude higher" than predator-free rates.
  - Postlarval mortality to 12 mm was not higher than later mortality, so there was no first-feeding peak.
  - Survival was unrelated to zooplankton at 44–388 crustaceans/L, and starvation was "probably not a major source".
  - Cyclopoid predation is probably "a minor source" in lakes.
  - Dytiscid larvae were the most abundant benthic invertebrates able to eat larvae, with unknown impact.

**Centrarchids**
- **Bluegill, Beard 1982** (WDNR TB 127, Table 11) [primary, re-read]. Camp and Lamereau lakes: 4 ha, 1.2–1.5 m max depth, soft water, bluegill only.
  - Daily Z from dispersal to day 4: 0.283 / 0.385 / 0.271 (Camp 1972–74) and 0.174 / 0.109 (Lamereau 1972–73).
  - Day 4 → fall: 0.001–0.008.
  - Dispersal → fall: 0.005–0.022 (seasonal Z 0.54–2.30).
  - The 4 days after dispersal set year-class strength.
  - Fry grew 0.4–0.7 mm/d during their first 2 limnetic weeks.
  - These lakes had no piscivores, but adult bluegill eat larvae: 94 % of water-column predation on Lake Opinicon nests was by conspecific bluegill (Gross & MacMillan 1981, via WDNR review) [secondary †]. So Beard's day 0–4 rate includes cannibalism [inf].
- **Deep Lake, MI** (Carbine 1948, rotenone, incomplete recovery so survival is biased low) [primary †, spot-checked]:
  - fry → 12 Sept 1941: largemouth bass 226,000 → 569 (0.25 %); bluegill 10.2 M → 9,872 (0.097 %); pumpkinseed 583,000 → 1,402 (0.24 %);
  - across year classes, survival to the poisoning date was bluegill 0.0007–0.097 %, pumpkinseed 0.013–0.49 %, largemouth 0.012–0.25 %.
- **Lake Opinicon, ON** (bluegill and pumpkinseed, 1998–99; Garvey, Herra & Leggett 2002, Ecol. Appl. 12:194) [abstract]:
  - embryos on nests and open-water larval density were unrelated;
  - 40 % of larvae were in open water by 12 June, but most fall juveniles were produced later, so early larvae died heavily;
  - larval → juvenile survival was unrelated to edible zooplankton at swim-up and often highest above 23.5 °C.
- **Lake Opinicon 1993** [abstract]: early fry had "strikingly higher" survival to age 1, +231 % representation (Cargnelli & Gross 1996, CJFAS 53:360).
- Mesocosms and Lake Shelbyville: bluegill larval survival was "uniformly high", unrelated to fish density or zooplankton, while shad survival tracked zooplankton (Welker et al. 1994, TAFS 123:703) [abstract].
- Alabama ponds: density-dependent larval growth and survival, with peak density >360/m³. Juvenile recruitment was **not** set in the larval stage (Partridge & DeVries 1999) [abstract].
- **Smallmouth bass** [mostly †]:
  - **Under guarding:** daily loss ~7–15 %, highest from swim-up to metamorphosis (Knotek; Steinhart 2008).
  - **Nest success:** 45–94 % (Ontario lakes and rivers; Philipp et al. 2023); 47–86 % of nests reached first feeding at Opeongo (Friesen & Ridgway 2000).
  - **Opeongo sizes:** swim-up 9.5 mm, metamorphosis 14–18.5 mm, dispersal at ~28 mm.
  - **Maine:** Spednic Lake (ME–NB) uses Shuter's rule — nest mortality is total if the 15-d minimum is below 10 °C, p = 3.0 − 0.2·T_min over 10–15 °C. Early mortality >10 % in 17 of 39 years, up to 56 % (Dudley & Trial 2014, USGS SIR 2014-5164) [primary †].
- **Largemouth bass, Lake George, MN** (Kramer & Smith 1962) [abstract †]: egg survival 0–94 %, nest success 0–100 %. Wind and temperature in the egg-to-2-weeks-post-nest window set year-class strength.

**Esocids** (pickerel proxy) [mostly †]:
- egg → fingerling ~1 % over ~55 d, Z ≈ 0.08 (Fago 1977);
- egg loss ~10 %/d (Wright 1988);
- released 16-dph pike larvae: ≥26-d survival 2.4 % in channels vs 0.13 % elsewhere, Z ≤ 0.14–0.26 (Massa & Farrell, Wetlands 40:273) [snippet];
- cannibalism from 21–38 mm (Fago).
- No chain pickerel larval data exist.

**White sucker, brown bullhead, fallfish, blacknose dace, banded killifish**
- No lake larval Z found.
- White sucker egg → migrant fry ~0.3 % (Geen et al. 1966) [snippet †]; `egg_stage.md` lists 0.3 % vs 3 %, unresolved.
- Brown bullhead: both parents guard the fry ball, mainly against predation (Blumer 1985) [snippet †].
- Cyprinid age-0 Z 0.037–0.083 (Wilde & Durham 2008) [abstract †] is the only proxy.

### Q2. Invertebrate vs fish predation vs starvation

**Field partitions** (all point to fish):
- **Perch, Lake Ontario ponds:** Z 1.58 with alewives vs 0.22–0.28 without, explained by alewife predation. Temperature, wind and food did not explain it (Mason & Brandt 1996) [abstract].
- **Eurasian perch, Scottish lochs:** "cannibalism by adults accounted for most of larval mortality"; food not limiting (Treasurer 1989) [abstract].
- **Walleye:** lakes 0.20–0.35 vs predator-free enclosures and ponds 0.012–0.046 (invertebrates present there). In the one pond year with piscine predators, 0.134 (Johnston 1995) [primary].
  - That puts **non-fish causes at ≤ ~5–25 % of lake larval Z** [inf].
- **Bluegill:** young largemouth bass ate 58–93 % of littoral bluegill fry at Ridge Lake, IL (Santucci & Wahl 2003) [abstract †]. In nests, median predation loss was 68 % unguarded vs 14 % guarded (Bain & Helfrich 1983) [abstract †].
- **Starvation:**
  - In Alabama, 65–79 % of 5–6-mm bluegill had empty stomachs early in the season, but the authors could not separate starvation from predation (Partridge & DeVries 1999) [secondary].
  - Johnston found starvation not major for walleye at ≥44 crustaceans/L.
  - Welker found bluegill survival independent of zooplankton.
  - In Letcher et al.'s IBM, the *cause* of death (starvation vs predation) depended on larval metabolism and on density of the smallest prey [abstract].
- **The critical period is not universal.**
  - Beard's bluegill: first 4 days at 0.1–0.4/d.
  - Carp gudgeon: Z 1.4/d at 1–2 d, then 0.03 (McCasker et al. 2014) [secondary: `fish_zooplankton_coupling.md`].
  - Walleye ponds: no first-feeding peak (Johnston).
  - Hardyhead: constant 0.15 (McCasker).

**Cyclopoid copepods**
- **Lake Michigan 1975–76** (Hartig, Jude & Evans 1982, CJFAS 39:1563) [abstract]:
  - 98 % of attached cyclopoids were on alewife larvae, 2 % on spottail shiner, and none on yellow perch, smelt, carp or sculpin;
  - most victims were 3–8 mm, and older larvae and "robust" species such as yellow perch were "apparently immune";
  - 99 % of attacks were in July, attached copepods appeared only in night samples, and 99 % of attackers were adult female *Diacyclops thomasi* and *Acanthocyclops vernalis*.
- **Inland coastal lake** (Pigeon L., MI, per secondary; Hartig & Jude 1984, CJFAS 41:526) [abstract]:
  - exceptional perch spawning gave larvae **up to 41,900 per 1000 m³ (41.9/m³)**;
  - adult female *D. thomasi* attacked newly hatched perch at up to 8,740 attacks per 1000 m³;
  - so ≤ ~21 % of larvae were carrying a copepod at peak, as a snapshot rather than a rate [inf †].
  - The authors attribute the lack of predation on other species to asynchrony, low encounter, robustness and escape ability.
- **Lab, Ohio** (Fabian 1960) [primary †]:
  - 5-d exposures of bluegill fry to 10–50 / 51–100 / 101–150 cyclopoids/L gave 80 / 94.7 / 100 % loss vs 10.2 % in controls;
  - that is excess Z ≈ 0.30 and 0.57/d, or **≈0.01/d per cyclopoid/L** [inf †];
  - rock bass lost only ≈0.07/d at 20–50/L;
  - **fry ≥ 8 mm mostly survived even at 1000/L**.
- **Lab, aquaculture species** (Frimpong & Lochmann 2005, NAJA 67:66) [abstract †]: only *Morone* hybrid larvae suffered, and only at ≥ 400 cyclopoids/L. Golden shiner and fathead minnow larvae >5 mm were safe below 500/L. Rates were "much lower" than a marine-based crustacean model predicted.
- **White perch and striped bass larvae** with *Cyclops bicuspidatus thomasi*: Smith & Kernehan 1981, Estuaries 4:81 (doi:10.2307/1351547). Not read (JSTOR); white perch larvae are known cyclopoid prey [inf].
- **Walleye** [primary]: cyclopoids at >500/L kill 8–10-mm walleye in the lab, but dense aggregations are local in nature, so they are "a minor source" (Johnston 1995).

**Hydra**
- Lake Opinicon (Elliott, Elliott & Leggett 1997, L&O 42:1416) [abstract]:
  - *H. canadensis* reached up to **30,000/m²** on *Myriophyllum*;
  - ingestion in 8-L microcosms was 0.197 larvae per predator per h at night and 0.111 by day;
  - 26 % of larval deaths came after larvae escaped the tentacles;
  - black (larva-fed) hydra made up 72 % of hydra in colonies, 45 % at 0.5 m and 31 % at 2 m;
  - **up to 20 % of a colony's bluegill larvae are killed within 2 m**, plus more lake-wide.
- In an outdoor tank, thousands of hydra moved onto bluegill nests and killed all newly emerged fry (Clady & Ulrikson 1967, MI IFR 1732) [primary †].

**Odonates, Notonecta, dytiscids, amphipods** [mostly †; lab or pond]:
- *Anax*/*Pantala* field guts almost never hold fish: 1 of 253 in Warren 1915 (via Wilson 1920) [primary †].
- Carp fry 7–19 mm, fry per insect per day: *Pantala* 1.64, *Notonecta* 1.5, *Coenagrion* 0.43 (González & Leal 1995) [snippet].
- *Orthetrum* nymphs eat ≈2.3–2.8 fry per nymph per day in the lab [inf from primary †].
- *G. pulex*: up to 9.4 yolk-sac carp larvae per day at 13.9 °C (Taylor & Dunn 2016) [primary †].
- In Cameroon *Clarias* ponds, excluding aquatic arthropods changed mortality insignificantly (−5.7 %) vs 28 % for amphibians and 21.7 % for birds (Sulem & Brummett 2006) [snippet †].
- *Chaoborus*, *Leptodora*, leeches and mysids: no records found of predation on fish larvae.

### Q3. Peak larval densities and their decline

| Species | Peak density | Stage | Place | Source | Tag |
|---|---|---|---|---|---|
| Yellow perch | **41.9 /m³** (exceptional spawning) | Newly hatched | Inland coastal lake, MI | Hartig & Jude 1984 | [abstract] |
| Yellow perch | Long-term mean **6.8 /m² of lake** (27,700/acre); chart axes to ~160,000/acre (≈40/m²) | 18 mm | Oneida L. | NYSDEC/Cornell; OLA 2026 | [secondary: `fish_zooplankton_coupling.md`, `forage_fish_early_life.md`] |
| Yellow perch | **0–4.76 /m³** (0–476 per 100 m³), differing among lakes, not years | Age-0, 15–25 mm, mid–late June, limnetic neuston tows | 7 north-central MN lakes, 207–1,923 ha, mean depth 3.8–15.3 m | Karppinen 2018 MS, Bemidji State | [primary] |
| Eurasian perch | Night densities 0.012–0.365 /m³; 298 → 46 → 64 → 25 per 1000 m³ over 19 June–10 July (pelagic + inshore movement) | Larvae → juveniles | L. Constance (deep, oligotrophic) | Wang & Eckmann 1994, Hydrobiologia 277:135, Table 2 | [primary] |
| White perch | Cohort N₀ ≈ 0.3–16 /m³, early cohort up to ~265 /m³ (back-calculated) | Larvae | Hudson R. | Limburg et al. 1999 | [primary]; conversion [inf] |
| Walleye | ~1 /m³ (stocked); 0.012–0.05 /m³ in NY lakes | Larvae | Oneida, NY lakes | Johnston 1995, Table 2.1 | [primary] |
| Bluegill | Fry leaving nests up to **645,000/ha = 64.5 /m²**; 4 d after dispersal **54,000–205,000/ha = 5.4–20.5 /m²**; fall fingerlings up to 376,000/ha | 5 mm → fall | Beard's WI lakes (bluegill only, no piscivores) | Beard 1982 | [primary †] |
| Bluegill | >360 /m³ | Larvae | Alabama impoundments | Partridge & DeVries 1999 | [abstract] |
| Lepomis | 0.28–0.51 /m³ | Larvae | Claytor L., VA | — | [snippet †] |
| Pumpkinseed | First seen 3 June, peak late June, 7× denser in the littoral, **zero by the third week of July** (~3–4 weeks from peak) | Larvae | Ashby L., ON | Sobchak et al. 2026, EBF (PMC13033004) | [primary †; values in a figure] |
| Smallmouth bass | Within a brood, ~380 /m² at first feeding and ~27 /m² at metamorphosis (1,000-fish brood on 0.8–5.8 → 14.8–64.1 m²) | Brood | L. Opeongo | Friesen & Ridgway 2000 | [primary †]; densities [inf †] |
| Pike | Drifting fry peak 3.81 /m³; marsh fingerlings 131–1,312/ha; density-dependent loss above ~5 larvae/m² | Fry | MN river; WI marshes; UK ponds | Stott 2015; Fago 1977; Wright & Giles 1987 | [snippet / primary / abstract †] |

**Declines.**
- Lake Constance: pelagic perch density fell ~6× in one week (19 → 26 June), a mix of mortality and inshore movement [primary].
- Beard: fry density fell 35–79 % in the 4 days after dispersal [inf from Table 11].
- Ashby Lake pumpkinseed: peak to zero in ~3–4 weeks (mortality plus settling).
- Hudson white perch cohorts: half-lives of ~1.4–4 d at Z 0.19–0.5 [inf].
- At field Z 0.1–0.3/d, a cohort halves every 2.3–7 days and keeps ~0.01–5 % after 30 days [inf].

**Biomass check.**
- In Oneida, *Daphnia pulex* tolerated ~10 kg/ha of age-0 perch and collapsed above 20–40 kg/ha (Mills & Forney 1983) [secondary: `forage_fish_early_life.md`].
- 100 larvae/m² at ~10 mm (~10 mg wet) is ~10 kg/ha; the same number at 20 mm (~80 mg) is ~80 kg/ha [inf].

### Q4. Survival from egg to age-0 (end of first summer)

| Species | Egg → fall age-0 survival | Place | Source | Tag |
|---|---|---|---|---|
| Yellow perch | Egg → 8 mm 1.6–18.4 % × 8 → 18 mm ~0.4 × 18 mm → fall ~1.3 % ⇒ **~0.01–0.1 %** | Oneida | Clady 1976; Irwin et al. 2009; NYSDEC | [inf] from [abstract]/[secondary] |
| Smallmouth bass | **0.1–0.5 %** (1979–81); 0.27–1.4 % (1982–85) | Nebish L., WI | Serns 1984; Raffetto et al. 1990 + Engel et al. 1999 | [abstract]; [primary †] |
| Bluegill | 4.9–22.6 % with no piscivores; nest fry → Sept 0.0007–0.097 % with piscivores | Beard's WI lakes; Deep L., MI | Beard 1982; Carbine 1948 | [inf from primary †]; [primary †] |
| Pumpkinseed | Nest fry → Sept 0.013–0.49 % (1941: 0.24 %) | Deep L., MI | Carbine 1948 | [primary †] |
| Largemouth bass | Egg potential → fall 0.11–13.7 % (ponds); nest fry → Sept 0.25 % (lake) | MI ponds; Deep L. | Laarman & Merna 1980; Carbine 1948 | [primary †] |
| Northern pike | Egg → fingerling 0.15–2.7 % (mean 1.1 %); egg → 0+ 0.037 % (natural water level) vs 0.4 % (level held) | WI marshes; Québec | Fago 1977; Massé et al. 1993 | [primary †]; [secondary: `egg_stage.md`] |
| Muskellunge | Egg survival on natural substrate 0–1.3 %; stocked 24-mm fry → fall 0–3 % | WI lakes; St. Lawrence | Zorn et al. 1998; Farrell & Werner 1999 | [primary / abstract †] |
| White sucker | Egg → migrant fry ~0.3 % (vs 3 %, unresolved) | BC inlet | Geen et al. 1966 | [snippet †] |
| Walleye | Postlarval mortality 95–96 % | Oneida bay | Noble 1972 via Johnston 1995 | [secondary] |
| All freshwater larvae | Survival to metamorphosis 5.3 % | Compilation | Houde 1994 | [abstract] |

---

## 3. What a simulation should use [inf]

These are inferences. They are built from the mechanisms above, not tuned to an outcome.

**3.1 Split larval mortality by cause, as the field data do.**

1. **Background (non-fish) hazard.** This covers invertebrates, disease and physical loss, with failed first feeding emergent from the energetics where possible.
   - **Constraint:** predator-free enclosures and ponds, which still contain cyclopoids, dytiscids and odonates, give **0.01–0.03/d** for 9–30-mm larvae. The full range is 0.0055–0.087, with typical values 0.012–0.046 (walleye, Johnston Table 2.1; L. St. George enclosures 0.016–0.028). Beard's bluegill after day 4 gave 0.001–0.008.
   - **Recommendation:** `M_LARVA3` at 1 cm ≈ **0.02/d**, held ≤ 0.03.
   - **At 5–8 mm only,** add an explicit cyclopoid term: **Z_cyc ≈ k·C·S(L)**.
     - C = adult + C5 cyclopoids per litre (night-active).
     - k ≈ 0.003 L/d per copepod. Fabian's lab value is 0.01, which confinement inflates; Frimpong found observed rates far below model predictions.
     - S(L) = 1 at ≤ 4 mm, falling linearly to 0 at 8 mm.
     - Robust larvae (yellow perch, centrarchids at swim-up) get 0.3–0.5× and thin-bodied larvae (white perch) 1×.
     - At 10–30 cyclopoids/L that is ≈ 0.03–0.09/d on the smallest larvae.
   - **Optional extra:** a *Hydra* term at sunfish nests in dense weed — up to ~20 % of a colony's swim-up larvae within 2 m, scaling with weed cover around the nest.
   - **Result:** the background at swim-up stays near today's ~0.08/d. Above ~1 cm it should be **lower** than today's 0.04/d.
2. **Fish predation (explicit; the dominant share).**
   - Field totals in lakes with fish are 0.05–0.3/d at 5–20 mm, against ≤ 0.03 without fish. So **≥ 70–90 % of larval Z in a lake should come from fish eating larvae**.
   - The predators that matter:
     - adult perch and white perch;
     - planktivores meeting larvae while feeding;
     - early-hatched perch larvae ≥ 10 mm eating later hatchlings. Brabrand: largest prey length ≈ 0.48·L + 1.8 mm, i.e. about half the predator's length, more generous than the sim's ≤ 1/3 rule;
     - pickerel and pike fry from ~21–38 mm;
     - young bass in the littoral.
   - **Alewife caution:** if sea-run alewives in Lower Hot Brook overlap the perch larval period, Mason & Brandt imply they alone can push perch larval Z to ~1.5/d.
   - **The emergent target is the total**, checked by the young-of-year fate audit (the stage survival audit memory):

     | Group | Target total Z |
     |---|---|
     | Yellow perch larvae | 0.05–0.25/d (Oneida 0.04 is the large-lake floor; small-lake and pond values 0.15–0.5; Eurasian perch 0.02–0.09) |
     | White perch larvae | 0.1–0.3/d (Hudson median ~0.27) |
     | Limnetic Lepomis | ~0.1–0.4/d for the first ~4 d off the nest, then whatever the lake's predators impose (0.05–0.10/d averaged to September in Deep Lake) |
     | Smallmouth bass | brood Z 0.07–0.15/d while guarded (including nest failure), then 0.02–0.05/d dispersal → fall |
     | Pickerel | ~0.08/d egg → ~60–90 mm |
     | Sucker, bullhead, minnows, killifish | 0.04–0.08/d juvenile proxy |

   - Freshwater larvae as a whole should reach the end of the larval stage at a few percent (Houde: 5.3 %).
3. **Starvation.** Leave it to the FB4 energetics. The field evidence (Johnston, Welker, Treasurer, Garvey) says it is rarely the proximate killer of lake larvae once they feed at ≥ ~50 prey/L. It is allowed to dominate the first winter.

**3.2 Size and temperature form.**
- Size:
  - Pepin's catch-curve slope is L^−1.5, the vertical-life-table slope L^−0.4, and Lorenzen's juvenile slope ~L^−0.9.
  - The sim's 1/L lies inside this range, so keep it.
- Temperature: Pepin 1991 finds per-length cumulative mortality independent of temperature. Two consistent options:
  - (a) express the background per mm grown: z_mm ≈ 0.04–0.07/mm, from Johnston's enclosures at ~0.4 mm/d; or
  - (b) keep a per-day rate with Q10 ≈ 1.8 (Houde 1989) **only if** larval growth in the sim carries a similar Q10.
- Today's `M_JUV_Q10` of 3 applied below 20 °C is steeper than either for larvae. White perch Z even *fell* with warming in the Hudson.

**3.3 Density checks for the 3-D lakes (mean depth ~3 m).**
- **Typical peaks per species:** 0.1–5 larvae/m³ (MN lakes 0–4.8; Lake Constance ≤ 0.37; walleye lakes ≤ 1), i.e. **~0.3–15 per m²**.
- **Exceptional:**
  - 42/m³, ≈ 125/m² locally, in one perch lake;
  - bluegill-only, predator-free 4-ha lakes: 5–20/m² four days after dispersal, 64/m² as fry leave the nests;
  - southern ponds: >360/m³.
- **Whole-lake means:** Oneida's 18-mm perch averaged 6.8/m².
- **Expectation [inf]:** all species together should sum to **≲ 10–40 larvae/m² at the seasonal peak**, and any one cohort should fall by half every ~2–7 days. Sustained 50–160/m² is at or beyond the highest field values. If the sim's swim-up numbers are right, its total larval Z is too low. Per 3.1, the missing part is predation by fish, not the background term.
- **Biomass:** age-0 fish biomass >20–40 kg/ha should strip *Daphnia* (Oneida). 100/m² of 20-mm larvae is ~80 kg/ha, so the sim's stripping is what the field predicts *at those densities*.

**3.4 Check the inputs before raising any mortality.**
- **Swim-up numbers per m².** Compare the sim against:
  - Oneida: back-calculating 18 mm at 6.8/m² with Z 0.042 over ~21 d gives ≈ 16/m² at 8 mm;
  - Beard: 64/m² at nest emergence in bluegill-only lakes.
- **Explicit predation.** Ask whether the explicit predators actually overlap the larvae in space and time:
  - pelagic larvae vs littoral adults;
  - night vs day;
  - Hot Brook's shallowness should put larvae within reach of littoral predators more than in Oneida.

---

## 4. Gaps

- **Syntheses not read:**
  - Houde & Zastrow 1993 (Bull. Mar. Sci. 53:290): freshwater Z means and stage durations;
  - Houde 1994 full text (Table 1);
  - Houde 2002 (Fuiman & Werner, ch. 3);
  - Bailey & Houde 1989;
  - Miller et al. 1988 coefficients;
  - Pepin 1991 coefficients.
- **Small-lake perch:**
  - Whiteside et al. 1985 (Lake Itasca) numbers;
  - Post et al. 1992 (Lake Mendota larval planktivory);
  - Te Brugge & McQueen and Post & McQueen densities;
  - Urho 1996 and Kjellman et al. 1996 (Finnish perch larvae; annzool.net was down for maintenance, jukuri.luke.fi refused connections).
- **White perch:**
  - no lake larval Z (only estuary and tidal-river values);
  - Smith & Kernehan 1981 (cyclopoids × white perch larvae) and Margulies 1990 (EBF 27, white perch larval vulnerability to fish) not read.
- **Lepomis:**
  - redbreast sunfish: nothing;
  - Lepomis limnetic densities per m³ in northern lakes are only in figures (Garvey 2002 full text was behind a Cloudflare check, not bypassed).
- **No larval-stage data at all** for chain pickerel, white sucker in lakes, brown bullhead brood numbers, fallfish, blacknose dace or banded killifish.
- **Invertebrates:**
  - no field cyclopoid kill rate in natural volumes for North American lake larvae;
  - no *Chaoborus*, *Leptodora* or leech data;
  - no odonate share in a lake with fish.
- **Maine:**
  - nothing for Maine lakes beyond smallmouth nest-temperature failure at Spednic Lake;
  - nothing on whether sea-run alewives overlap perch larvae in Hot Brook (timing check needed).

---

## 5. Access log

**Read by me:**
- **Johnston 1995 PhD thesis (Table 2.1, walleye Z):** mspace.lib.umanitoba.ca/bitstreams/9b048a12-b503-45cf-a919-ac2f77a2d7d0/download — OK.
- **Limburg et al. 1999 (Table 2, white perch Z):** spo.nmfs.noaa.gov/sites/default/files/08limbur.pdf — OK.
- **Wang & Eckmann 1994 (Table 2, densities):** kops.uni-konstanz.de/bitstreams/71ec3a02-abaa-4d10-99d3-fecd3a449ff9/download — OK.
- **Karppinen 2018 MS:** faculty.bemidjistate.edu/…/Thesis.-2018-Karppinen-E.pdf — OK.
- **Pepin 2016:** academic.oup.com/icesjms/article/73/2/196/2614195 — OK; text read through 100k characters.
- **Houde 2008:** journal.nafo.int/Volumes/Articles/ID/418/Files — OK, but no larval Z numbers.
- **Abstracts via api.openalex.org/works/doi:… (single-record lookups worked) and api.crossref.org:**
  - Mason & Brandt 1996, Clady 1976, Hartig et al. 1982, Hartig & Jude 1984;
  - Partridge & DeVries 1999, Garvey et al. 2002, Welker et al. 1994, Cargnelli & Gross 1996;
  - Elliott et al. 1997, Treasurer 1989, Brabrand 2001, Post & McQueen 1988;
  - Wang & Appenzeller 1998, Serns 1984, Raffetto et al. 1990, Nielsen 1980;
  - Pepin 1991, Miller et al. 1988, Letcher et al. 1996, Rice et al. 1993.
- **Re-read in the sub-researchers' downloads:** Beard 1982 Table 11 and Carbine 1948 survival text.

**Failed or not attempted:**
- **www3.epa.gov AR-318 (Houde 1994):** 301 to an index page.
- **fishbase.se:** connection refused. **fishbase.ca:** 403.
- **vliz.be 275228.pdf:** a different paper (Houde et al. 1993, mesocosms; marine).
- **repository.lib.ncsu.edu:** FortiADC block page.
- **d.lib.msu.edu (Roseman 1997; Mendota-area theses):** "access limited".
- **digitalcommons.unl.edu (Kaemingk 2014 PDF):** Cloudflare challenge, not bypassed.
- **link.springer.com (Whiteside 1985; the 2025 perch review):** login redirect.
- **annzool.net (Urho 1996):** maintenance page. **jukuri.luke.fi:** ECONNREFUSED.
- **OpenAlex search endpoint:** shared anonymous daily budget exhausted. Its message invited registering an email key; ignored, and no email was given.
- **Europe PMC search for the perch review:** no hit.

**Sub-researchers (†), per their logs:**
- **Worked:**
  - vtechworks (Knotek abstract);
  - harkness.ca (Friesen & Ridgway; Steinhart 2008);
  - asset.library.wisc.edu (Beard TB 127, Fago TB 96, WDNR reports);
  - Raffetto 1990 PDF;
  - fecpl.ca (Philipp 2023);
  - OhioLINK (Steinhart 2004);
  - MI DNR RR1166 and RR1886;
  - USGS SIR 2014-5164;
  - Europe PMC (PMC5072656, PMC13033004, PMC5741715, PMC7175601);
  - academic.oup.com abstracts;
  - kb.osu.edu (Davis 1959; Fabian 1960);
  - spo.nmfs.noaa.gov (Wilson 1920);
  - memorial.scholaris.ca (Paradis thesis);
  - periodicos.uem.br, natuurtijdschriften, zoolstud.sinica, MI DNR RR1732, research.qubs.ca, gwct.org.uk.
- **Failed:**
  - Springer, Wiley/ESA, cdnsciencepub, sciencedirect, tandfonline (403 or login);
  - biodiversitylibrary.org and opensiuc (Cloudflare, not bypassed);
  - DTIC and ERDC (bot checks);
  - d.lib.msu.edu (restricted);
  - Semantic Scholar (429).
- **Instruction-like text seen:** none, other than OpenAlex's prompt to register an email key, which was ignored.
- **Downloaded PDFs** stay in the session scratchpad (`larval_main/`, `larval_centrarchid/`) and are **not** in the repo.
