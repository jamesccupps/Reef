# Horizontal (3-D) physics and biogeochemistry of small, shallow, polymictic north-temperate lakes, for a coarse real-time 3-D grid

Scope: the processes that make a small shallow lake differ from one well-mixed 1-D column, with rates and formulas you can implement; how 3-D and 1-D/multi-box models handle them; and the cheapest approximations that keep the behaviour. Target: Upper Hot Brook Lake (360 ha, mean 3.35 m, max 5.5 m, 3.2 km long) and Lower Hot Brook Lake (277 ha, mean 2.74 m, max 4.0 m, 2.9 km long), 45.9° N, tea-coloured, ice ~Dec 1 – Apr 23, polymictic. Lengths are from the repo's `docs/HOT_BROOK_SIM.md`. Planned grid: 25–100 m columns × 0.3–0.5 m layers.

Source-quality note: several primary papers (Monismith et al. 1990; Kirillin et al. 2012; James & Barko 1991; Burks et al. 2002; Wüest & Lorke 2003) are paywalled. Their findings below come from the abstract or from how later open papers report them, and are flagged where that matters. Every value marked "large/deep lake" comes from a system far outside the ≤10 km², ≤10 m target.

---

## 1. Wind-driven circulation: surface drift, return flow, Langmuir cells, upwelling, seiches, current speeds, horizontal diffusivity, cove flushing

### Takeaway
In a shallow unstratified lake, wind drives a thin downwind surface drift (~3 % of U10) with a near-bottom return flow. Depth-averaged, it sets up two counter-rotating topographic gyres: downwind over the shallows, upwind over the deep axis. These spin up and reverse within hours. Typical currents are 1–10 cm/s. For horizontal mixing at the grid scale, use an eddy diffusivity that grows roughly linearly with cell size: ~0.01–0.03 m²/s at 100 m (Lake Constance drifters) and ~0.01–0.05 m²/s at 25–100 m (the small-lake tracer fit). Surface seiches in these lakes have periods of ~19 min and setups of only a few cm.

### Cited Findings
**Surface drift and vertical structure**
- Early pond and tank studies put surface drift at ~3 % of wind speed under turbulent conditions; other experiments found 2.5–4.0 %. A source-water assessment adopted 3 % for lake transport (citing Tsinker 1995; Bye 1965). The same report cites lake measurements (Bye 1965; Liu & Perez 1971) showing wind-driven velocity decaying roughly exponentially with depth, with almost no wind influence by about one-third of the water depth. — [Mississippi-Rideau source-water assessment, Ch. 6 appendices](https://www.mrsourcewater.ca/images/Documents/Assessment-Report/appendices/101110_Chp%206%20Appendices.pdf)
- The drift/wind ratio falls gradually as fetch increases and approaches ~3.5 % at very long fetch (laboratory/field review). — [Wind-induced drift currents, J. Fluid Mech.](https://resolve.cambridge.org/core/journals/journal-of-fluid-mechanics/article/windinduced-drift-currents/41EA31AC4E0BFCB803B872E599348974)
- At sea, undrogued drifters (5 cm draft) moved at 3.4–6.0 % of wind speed, deflected to the right of the wind; drogued drifters (60 cm) moved at 2.3–4.1 %. These are ocean values and include wave Stokes drift. — [Ocean Science 15:1627 (2019)](https://os.copernicus.org/articles/15/1627/2019/os-15-1627-2019.pdf)
- A wind-tunnel/lake study estimated the bottom stress from the return current at ~1.5 % of the wind stress. — [A note on the velocity distribution and bottom stress in a wind-driven water current system](https://core.ac.uk/works/144327514)
- In an unstratified lake the wind-induced surface current has a return flow at depth, near the bottom; in a stratified lake the return flow runs along the top of the thermocline. Currents veer to the right of the wind in the Northern Hemisphere. — [Sytsma, PSU limnology lecture "Water in motion" (after Kalff)](https://web.pdx.edu/~sytsmam/limno/Limno09.10.Motion.pdf)
- Shallow polymictic Lake Wolsztyńskie (Poland; ADCP at 8 sites monthly, Jun 2019 – May 2020):
  - current speed declined consistently with depth;
  - mean circulation speed rose with wind, but only weakly — local controls and non-linear response dominated;
  - surface flow aligned with wind-driven transport in fewer than half of observations;
  - near-bottom return currents opposite the surface flow were frequent;
  - Ekman veering was only intermittent ("truncated Ekman dynamics", two-layer pattern);
  - vegetated littoral sites had substantially weaker currents than unvegetated sites of similar depth.
  
  (Abstract only; no cm/s values seen.) — [Tritt, Limnological Review, DOI 10.3390/limnolrev26030030](https://www.citedrive.com/en/discovery/wind-driven-circulation-in-a-shallow-polymictic-lake-the-case-of-lake-wolszty%C5%84skie/)

**Depth-averaged gyres (topographic circulation)**
- Lake Pontchartrain (USGS 3-D model, ~5 m/s SE wind): depth-averaged flow runs downwind in the shallow periphery and against the wind in the deeper centre. — [USGS OFR 98-805 (Signell)](https://pubs.usgs.gov/of/1998/of98-805/html/signell5.htm)
- A strong uniform wind over a depth-variable lake commonly forms two counter-rotating gyres (Csanady 1973; Bennett 1974; Simons 1980). Downwind flow runs in the shallow nearshore ("coastal jet") and upwind return flow over the deep basin. Smaller lakes (Erie, Ontario) show the two-gyre pattern. In Lake Markermeer (modelling), depth variation drives the gyres, and uniform-depth lakes show little horizontal flow. The gyres need wind of roughly constant direction for some time. — [Lake Geneva 3-D circulation, GMD 15:8785 (2022)](https://gmd.copernicus.org/articles/15/8785/2022/)
- Lake Rotorua (NZ; large, shallow, polymictic; ADCP + ELCOM): circulation was set mainly by topography, varied little with depth during winter mixing, and reversed within ~6 h when the wind shifted. Seen via abstract and search summary. — [Griffith repository record](https://research-repository.griffith.edu.au/items/29f80cec-9676-545c-884d-8f2afd653793)

**Current magnitudes**
- Lake Constance surface drifters (winter, weakly stratified, winds 1–5 m/s): mean current components were typically < 5 cm/s, occasionally up to almost 10 cm/s. A clockwise ~15-h rotating component appeared (Poincaré wave). Large/deep lake. — [Peeters & Hofmann 2015, L&O 60:1917 (KOPS full text)](https://kops.uni-konstanz.de/bitstream/123456789/32231/3/Peeters_0-309524.pdf)
- Clear Lake, CA (large, polymictic, Si3D model): night/morning baroclinic pressure gradients drove currents of up to 10–15 cm/s (westward at the surface, eastward near the bottom). Diurnal wind cycles plus rotation produced a residual cyclonic circulation ("baroclinic pumping"). — [EPA project abstract (Schladow)](https://cfpub.epa.gov/ncer_abstracts/index.cfm/fuseaction/display.abstractDetail/abstract_id/5976/report/F); [Rueda & Schladow 2003, J. Hydraul. Eng. 129:92](https://produccioncientifica.ugr.es/documentos/618fa3394fa218568b4e09e1?lang=en)

**Langmuir circulation**
- Above 2–3 m/s wind, wind-parallel streaks appear at the convergences of counter-rotating helical cells. Vertical velocities reach at least 1–2 cm/s, roughly 5–10 % of the wind-induced horizontal current — enough to redistribute swimming plankton. — [Sytsma lecture](https://web.pdx.edu/~sytsmam/limno/Limno09.10.Motion.pdf)
- Reported maximum vertical velocity of 2–10 cm/s for 2–12 m/s wind. This is a secondary, encyclopaedic source, mostly ocean data. — [Wikipedia: Langmuir circulation](https://en.wikipedia.org/wiki/Langmuir_circulation)
- In a shallow Baltic lagoon, windrows formed within 5–10 min of wind onset; the most probable streak spacing was about twice the local depth. Abstract only; the ratio's reference quantity was not verified. — [Lithuanian lagoon paper (PDF)](https://gamtostyrimai.lt/wp-content/uploads/2022/06/101_d4fa73412dc3cb72748d1305114771cd.pdf)

**Wind stress, setup, seiches, upwelling**
- Eddy-covariance measurements over >30 lakes and reservoirs: the drag coefficient is ~1.6 × 10⁻³ at high wind and rises substantially below 3 m/s (gusts, capillary waves). — [Bulk transfer coefficients over lakes and reservoirs](https://e-docs.geo-leo.de/handle/11858/11524)
- Setup at the leeward end: Sh = 3.2 × 10⁻⁶ W² l / (g z_m) (W = wind speed, l = lake length, z_m = mean depth). — [Sytsma lecture](https://web.pdx.edu/~sytsmam/limno/Limno09.10.Motion.pdf)
- The setup coefficient varies by source: Ippen 3.3 × 10⁻⁶; the IJsselmeer committee 3.8 × 10⁻⁶ (1966); IJsselmeer data 2002–13 support 2.2 × 10⁻⁶; and a version with a wind-cubed term was proposed for strong winds. — [Wikipedia: Wind setup](https://en.wikipedia.org/wiki/Wind_setup)
- Merian seiche period: T_n = (1/n)·2L/√(g z_mean). The square root was lost in the PDF text but is the standard form. — [Sytsma lecture](https://web.pdx.edu/~sytsmam/limno/Limno09.10.Motion.pdf)
- Wedderburn number W ≈ g′h² / (u*² L) (Imberger & Patterson 1990). Upwelling or near-upwelling occurs around W ≈ 1. — [Lake response to wind stress (Utah notes)](https://www.inscc.utah.edu/~u0559900/lake_response_to_wind_stress.pdf)
- Laboratory work found upwelling at all W values, not only W < 1. — [Experimental study of the upwelling response of stratified reservoirs, JFM](https://www.cambridge.org/core/journals/journal-of-fluid-mechanics/article/an-experimental-study-of-the-upwelling-response-of-stratified-reservoirs-to-surface-shear-stress/E8C4D477533248D6840EEA52C24E5027)

**Horizontal (eddy) diffusivity vs length scale**
- Lake Constance drifters (scales ~30–3000 m):
  - K_disp ≈ 0.01–0.03 m²/s at L = 100 m; ≈ 0.1 m²/s at ~300 m; 0.1–0.7 m²/s at 1000 m;
  - K_disp grows ~linearly with L (fitted exponents 1.10, 1.09, 1.01 in three experiments; larger in the fourth) — slower than the 4/3 inertial-subrange law;
  - horizontal shear contributes < 40 % at 100–1000 m.
  
  The paper states that ELCOM and Delft3D prescribe a constant horizontal dispersion coefficient, with published lake grids of ~50 m to several km, so the coefficient should depend on grid size. — [Peeters & Hofmann 2015](https://kops.uni-konstanz.de/bitstream/123456789/32231/3/Peeters_0-309524.pdf)
- The small-lake tracer fit (Lawrence, Ashley, Yonemitsu & Ellis 1995, "Natural dispersion in a small lake", L&O 40:1519; Twin West Lake; L = 10–50 m): K_eff = 3.6 × 10⁻⁴ L^1.07 m²/s (L in m), giving ≈ 0.05 m²/s at 50 m. Extrapolating to 100–1000 m gives 0.1–1 m²/s. Lawrence et al. attributed the scale dependence to vertical shear plus vertical mixing — which a 3-D model resolves itself and should not double-count. — quoted in [Peeters & Hofmann 2015](https://kops.uni-konstanz.de/bitstream/123456789/32231/3/Peeters_0-309524.pdf)
- Thermocline tracer experiments in several lakes gave effective horizontal diffusivities of 0.02–0.3 m²/s, consistent with shear diffusion (Carter–Okubo). — [Peeters et al. 1996, "Horizontal mixing in lakes", JGR (EPFL record)](https://infoscience.epfl.ch/record/186949)
- Okubo's 1971 ocean diagram gives apparent diffusivity ∝ L^~1.1–1.15 for 100 m – 100 km. The commonly quoted prefactor (0.0103 cm²/s with L in cm) could not be confirmed. — [Horizontal transport in oil-spill modelling, arXiv 2009.12954](https://arxiv.org/pdf/2009.12954)
- Okubo's diagram cannot give detailed predictions; the scatter is more than an order of magnitude. — [Assaf et al. 1971, JGR](https://www.ldeo.columbia.edu/~agordon/publications/Assaf_et_al-1971-Journal_of_Geophysical_Research.pdf)

**Cove and bay flushing**
- In Lake George, NY (10 bays; validated 3-D model with water age as a tracer), most bays had mean ages under 3 days. Only small near-bottom pockets carried water older than a week. Bay-average age could drop sharply within one day of a strong wind. The authors call whole-lake residence time a poor proxy for these dynamics. — [Lake George residence time across scales, L&O Methods (NSF PAR)](https://par.nsf.gov/biblio/10499031)

### Inferences
**Hot Brook magnitudes** (my arithmetic from the formulas above):
- **Seiches.** c = √(g·3.35) ≈ 5.7 m/s in Upper and √(g·2.74) ≈ 5.2 m/s in Lower. Fundamental seiche ≈ 2·3200/5.7 ≈ 1120 s ≈ 19 min (Upper) and ≈ 2·2900/5.2 ≈ 19 min (Lower).
- **Setup.** At 10 m/s along the long axis: ~3 cm (Upper) and ~3.5 cm (Lower). Surface tilt is visually negligible but sets the barotropic pressure gradient that drives the return flow.
- **Stress.** At 5 m/s: τ ≈ 1.2·1.6e-3·25 ≈ 0.05 N/m², so water-side u* ≈ 7 mm/s.
- **Upwelling.** A 1 °C, 1-m afternoon diurnal thermocline at 22 °C gives g′ ≈ 2.3e-3 m/s². Then W ≈ 2.3e-3·1² / (4.8e-5·3200) ≈ 0.015 ≪ 1. Any moderate wind therefore tilts and destroys daytime stratification and brings near-bottom water up at the upwind shore. This is consistent with "does not stratify".

**What to simulate:**
- A depth-averaged topographic double gyre per basin, plus a two-layer vertical shear (downwind surface drift, return flow below).
- No real Ekman spiral: the Ekman depth exceeds the water depth.
- Coriolis is minor at these scales (f ≈ 1.05e-4 s⁻¹, inertial period ≈ 16.6 h). Poincaré and Kelvin dynamics need basins wider than the internal Rossby radius, which these lakes are not when they barely stratify.

**Spin-up time.** For linear bottom friction r ≈ C_D·u_b ≈ 2.5e-3 × 0.05 ≈ 1e-4 m/s, the barotropic spin-down time is H/r ≈ 3.35/1e-4 ≈ 9 h. Use a relaxation time of a few to ~10 hours toward the wind-equilibrium flow, consistent with Rotorua's ~6-h gyre reversal.

**Horizontal diffusivity.** For grid Δx (m), K_h ≈ 3.6e-4·Δx^1.07 m²/s (Lawrence fit), cross-checked against Peeters. This gives ≈ 0.011 m²/s at 25 m, 0.024 at 50 m and 0.050 at 100 m. These fall inside Peeters' 0.01–0.03 m²/s at 100 m. A single value of ~0.02–0.05 m²/s for 50–100 m cells is defensible. If the model has vertical shear (two-layer drift and return), use the lower end so vertical shear dispersion is not counted twice.

**Langmuir cells.** With ~2× depth spacing, cells are 2–10 m wide — far below grid scale. Represent them as:
- enhanced vertical mixing (full-depth mixing above ~3 m/s wind in water < 5 m);
- a visual/cosmetic windrow effect (Math.random side only) for floating matter and buoyant algae.

**Cove flushing.** Wind exchange should flush coves on day scales (Lake George bays < 3 days), much faster than the 55–100-day whole-lake residence times. Cove water age is therefore set by wind and convective exchange, not by through-flow.

### Gaps
- No small-lake (≤ 10 km², ≤ 5 m) measurement was found that gives depth-averaged current per unit wind speed. The Wolsztyńskie full text likely has cm/s values but was not retrieved.
- Okubo's exact prefactor is unverified.
- Monismith/Imberger-type wind-forced cove-to-lake exchange formulas for small lakes were not found. Lake George bays are deeper and stratified.
- The fetch-limited drift ratio for fetches < 3 km was not found.

---

## 2. Littoral–pelagic exchange: differential heating/cooling (thermal siphon), weed beds

### Takeaway
Shallow water cools (and warms) faster than deep water, so on most calm nights from late summer to early winter a cold density current flows down the slope and is replaced by a surface return flow. This "thermal siphon" flushes the littoral in roughly 7–20 h at about 1 cm/s mean (2–3 cm/s peak). It is weaker and wind-fragile during daytime heating, and winds above ~5 m/s overwhelm it. Dense macrophyte canopies cut currents by roughly an order of magnitude. Above ~50 % canopy height they damp daytime wind mixing, which produces warm surface water, bottom stratification and night-time bottom anoxia inside the bed, while night convection still mixes.

### Cited Findings
**Thermal siphon: Rotsee, Switzerland** (0.5 km², mean 9 m, max 16 m, sheltered; a ~1-m-deep, 200-m-long plateau drives the siphons; one year of ADCP data)
- Siphons occurred on 37 % of 227 days, on > 50 % of days from late summer to winter (87 % in November), rare by December, and absent in deep winter.
- Daily mean cross-shore velocity was 0.9 ± 0.2 cm/s; the daily maximum 2.6 ± 0.7 cm/s, usually in the morning.
- Unit-width discharge q ≈ 0.015 ± 0.004 m²/s; layer thickness ~1.8 m.
- Flushing time τ_F ≈ 9.7 ± 2.7 h (≈ 7 h in summer, ≈ 20 h in winter). One event flushes the whole littoral, often more than once.
- Lateral temperature gradient ~5 × 10⁻⁴ °C/m.
- Fitted scalings (Phillips 1966; Wells & Sherman 2001):
  - U_avg = 0.33 (B₀ L_ML)^{1/3}; U_max = 0.99 (B₀ L_ML)^{1/3};
  - q_avg = 0.34 (B₀ L_ML)^{1/3} h_lit;
  - τ_F = 2.99 L_lit / (B₀ L_ML)^{1/3};
  - where B₀ is the surface buoyancy flux (m²/s³), L_ML the horizontal length of the cooling mixed region, and L_lit, h_lit the littoral length and depth.
- Initiation time rose from ~3 h (late summer) to ~20 h (winter).
- Days were classed wind-dominated when |L_MO|/h_ML = κ⁻¹|u*/w*|³ > 0.5.
- Monismith et al. (1990) gave the first in-situ diurnal siphon cycle: ~2 cm/s cross-shore flow with inertial delays of several hours. Sturman et al. (1999) found ~1 cm/s.

— [Doda et al. 2022, HESS 26:331](https://hess.copernicus.org/articles/26/331/2022/)

**General scalings and the role of wind**
- Steady-state laboratory scaling for a triangular sidearm (bottom slope tanθ, length L): discharge per unit shoreline Q = 0.24 B^{1/3} [L tanθ/(1+tanθ)]^{4/3} (m²/s), with flushing time ∝ L^{2/3}(1+tanθ)^{4/3}/(B tanθ)^{1/3}. Exponents are from the PDF text; the fraction layout was partly lost in extraction (Sturman et al. 1999). — [Bouffard & Wüest 2019, Annu. Rev. Fluid Mech. 51:189](https://infoscience.epfl.ch/record/264776)
- The convective velocity scale is w* = (B h)^{1/3}. Typical w*: free-surface cooling 1–50 mm/s, under ice 1–7 mm/s. — [Bouffard & Wüest 2019](https://infoscience.epfl.ch/record/264776)
- Thermal siphons often co-occur with moderate winds (≲ 5 m/s) that drive cross-shore exchange of similar magnitude, limiting calm-condition parameterisations. Wind-driven circulation is still usually the main flusher of shallow waters. Heating-driven siphons are weaker and more easily disrupted by wind. (Abstract-level, via search.) — [Thermal siphon review, Flow (Cambridge)](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/A74DBF92A8FDA0331A471409712E383F/S263342592400031Xa_hi.pdf/thermally-driven-cross-shore-flows-in-stratified-basins-a-review-on-the-thermal-siphon-dynamics.pdf); [Ulloa/Doda et al., Water Resour. Res. 2022 (UGR repository)](https://digibug.ugr.es/bitstream/handle/10481/76702/Water%20Resources%20Research2022.pdf?sequence=1)
- Heating-driven siphons were excluded from Rotsee analysis because their lateral exchange is weaker and more wind-sensitive (Monismith et al. 1990; James et al. 1994). — [Doda et al. 2022](https://hess.copernicus.org/articles/26/331/2022/)
- Night cooling in bays sends dense water down into the main lake as an intrusion. By day, shallow bays warm faster and push warm surface currents out into the main lake (Kalff; Horsch & Stefan 1988; James & Barko 1991). — [Sytsma lecture](https://web.pdx.edu/~sytsmam/limno/Limno09.10.Motion.pdf)
- Constant per-area cooling under calm conditions sets a horizontal gradient along the littoral slope. It drives a cool undercurrent and an unstable surface return flow that exchanges littoral and pelagic water. — [Horsch & Stefan 1988 (UMN SAFL report)](https://conservancy.umn.edu/items/bf18fadd-b70f-40c1-b963-5d0b806c50ab)

**Biogeochemical consequence: Eau Galle Reservoir, WI** (summer 1989, dye tracing)
- Cooler littoral bottom water from inside macrophyte beds moved to the pelagic zone as an interflow, with warm pelagic water returning at the surface.
- Net TP flux from littoral to pelagic averaged 0.22 mg m⁻² h⁻¹. Night-time convective circulation was a key route for littoral P. — [James & Barko, USACE Technical Report A-93-4 (ERDC)](https://erdc-library.erdc.dren.mil/jspui/handle/11681/6377)
- Littoral P inputs, often left out of budgets, made up 15 % of measured P input. — [James & Barko 1993, Lake Reserv. Manage. 8:61 (USGS)](https://pubs.usgs.gov/publication/1003402)

**Macrophyte beds**
- Herb & Stefan field study: wind mixing during the day was significantly attenuated in dense, full-depth beds, which raised stratification and maximum surface temperatures. Night convective mixing was rather uniform between sites. — [Herb & Stefan 2004, Lake Reserv. Manage.](https://experts.umn.edu/en/publications/temperature-stratification-and-mixing-dynamics-in-a-shallow-lake-/)
- Herb & Stefan 1-D TKE/heat model: beds raise stratification and shrink the mixed layer but have little effect on night-time deepening. Lateral exchange between open water and finite beds may limit 1-D accuracy. — [Herb & Stefan 2005, WRR](https://experts.umn.edu/en/publications/dynamics-of-vertical-mixing-in-a-shallow-lake-with-submersed-macr/)
- Lake Monger (WA, 68 ha, 0.3–1.2 m, *Potamogeton crispus*; field data + ELCOM):
  - stratification began once plants filled > 50 % of the depth (logistic fit, r² = 0.98);
  - in-bed gradients reached ~10 °C/m (up to 10 °C over 0.8 m);
  - modelled stratification lasted 7.7 ± 2.9 h/day (canopy 50 % of depth) to 12.3 ± 5.9 h/day (100 %);
  - depth-averaged tracer velocity fell from 0.01 m/s (canopy 10 % of depth) to 0.001 m/s (full canopy) — ~90 % reduction;
  - bottom DO at the bed centre went from ~18 mg/L day / ~6 night (short canopy) to anoxic at night (December) and anoxic before sunset (January);
  - the plants prevented flushing of low-DO water out of the bed centre;
  - ELCOM settings: 5 m × 5 m grid, 0.1 m layers, 30 s step, canopy drag C_D = 1; macrophyte light extinction 2–4 m⁻¹ over background 1.5 m⁻¹. — [Vilas et al. 2017, Front. Plant Sci. (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5727088/)
- Floating-leaved and submersed species (Dale & Gillespie 1977) can warm surface water several degrees above open water while bottom water changes little over the day. Canopies cause early-morning DO minima. Daytime DO is high in the upper canopy and low in the shaded water beneath (Buscemi 1958; Frodge, Thomas & Pauley 1990). — [Honnell, Madsen & Smart 1993, USACE APCRP A-93-2](https://apcrp.el.erdc.dren.mil/elpubs/pdf/A-93-2.pdf)
- Macrophyte beds reduce current velocity within and next to the beds, raising sedimentation and lowering turbidity (abstract). — [Madsen et al. 2001, Hydrobiologia 444:71](https://link.springer.com/article/10.1023/A:1017520800568)

### Inferences
**Hot Brook siphon estimate (Doda scaling).**
- A clear autumn night loses ~100 W/m² at ~15 °C (α ≈ 1.5e-4 K⁻¹), so B₀ = gαQ/(ρc_p) ≈ 9.81·1.5e-4·100/4.19e6 ≈ 3.5e-8 m²/s³.
- With L_ML ≈ 500–1000 m: (B₀L)^{1/3} ≈ 2.6–3.3 cm/s, so U_avg ≈ 0.33 × that ≈ 0.9–1.1 cm/s.
- For a cove or shelf 200 m long: τ_F ≈ 2.99·200/0.03 ≈ 5.5 h.
- So on calm nights, coves and weedy shallows exchange with the open basin within one night. In a model, nights with u*/w* small should trigger a littoral↔pelagic exchange of order q ≈ 0.34 (B₀L)^{1/3} h_lit per metre of littoral edge (~0.005–0.01 m²/s for h_lit ≈ 0.5–1 m).

**Daytime.** Shallows run warmer by up to "several degrees" in weed beds, and exchange is weaker and mostly wind-driven. Model this as a weaker heating siphon (e.g., ⅓–½ of the cooling q) that switches off once wind u* dominates.

**Weed-bed cells:**
- velocity damping factor ≈ 1 − 0.9·min(1, canopy fraction); canopy fraction is grown by the existing plant model;
- daytime wind-mixing suppression when canopy height > 50 % of depth (stratifies, warms the surface, depletes bottom O₂ at night);
- night convection left unchanged.

This gives the documented pattern — supersaturated afternoon tops, hypoxic dawn bottoms in beds, open water near saturation — which also matters for where fish go at dawn and dusk.

**Grid resolution.** Because the siphon is an O(1–2 m)-thick bottom current over O(100–500 m) slopes, a 0.3–0.5 m × 25–100 m grid with a hydrostatic baroclinic pressure term could in principle resolve it. However, at the planned (compressed) time steps an explicit parameterised exchange is safer and cheaper (see Q6).

### Gaps
- No field study was found of thermal siphons in a lake as shallow as Hot Brook (≤ 5.5 m, mostly 1–4 m). Rotsee is deeper and sheltered.
- Monismith et al. 1990 full numbers (sidearm geometry, exchange per unit width) and James, Barko & Eakin 1994 (heating vs cooling) were not retrieved.
- No measured north-temperate weed-bed vs open-water day/night temperature and DO time series was retrieved with numbers; Frodge et al. 1990 and Dale & Gillespie 1977 are paywalled.
- PCLake's default marsh–lake exchange rate was not found. A 2008 study notes the open-water ↔ natural-littoral exchange had never been measured directly (see Q6).

---

## 3. Spatial heterogeneity actually observed: temperature, O₂, chlorophyll/metabolism, zooplankton, turbidity

### Takeaway
The open-water surface is fairly uniform in temperature but not in biology. Littoral zones have higher and more variable metabolism: GPP and R near the perimeter exceed mid-lake values, and site-to-site differences average 2.5–3.2-fold. Weed beds develop extreme diel O₂ swings. Zooplankton are patchy, steered by wind-driven basin circulation (circulation explained 29–47 % of *Daphnia* spatial variance in Windermere) and by diel horizontal migration into or out of weed beds. Wind-wave resuspension makes shallow, long-fetch areas turbid.

### Cited Findings
**Metabolism and O₂**
- Free-water DO metabolism with sensors along shore-to-centre transects:
  - GPP and R varied on average 2.5–3.2-fold from site to site within a lake, sometimes 6–7-fold;
  - perimeter rates were on average greater than mid-lake rates;
  - a model attributed ~40 % of epilimnetic GPP and R to benthic-littoral processes. — [Van de Bogert et al., "Assessing benthic and pelagic metabolism using free water measurements", L&O Methods (Notre Dame record)](https://curate.nd.edu/articles/journal_contribution/Assessing_benthic_and_pelagic_metabolism_using_free_water_measurements/24737490)
- Follow-up with 35 sondes in Sparkling Lake and 27 in Peter Lake (WI/MI; 10-min data over 10 days each, July/Aug 2007): "Spatial heterogeneity strongly affects estimates of ecosystem metabolism in two north temperate lakes" (L&O 57:1689, 2012; metadata only). — [LTER bibliography](https://lternet.edu/biblio/spatial-heterogeneity-strongly-affects-estimates-of-ecosystem-metabolism-in-two-north-temperate-lakes)
- Process-based modelling of a large shallow subtropical lake split into littoral and pelagic zones found significant differences in metabolism. Spatially distributed estimates led to different conclusions than single-point ones. — [Cavalcanti et al. 2016, Ecol. Model. 323:28](https://ideas.repec.org/a/eee/ecomod/v323y2016icp28-40.html)
- Weed-bed DO extremes (Lake Monger): see Q2. — [Vilas et al. 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5727088/)

**Temperature and other variables**
- In a Lake Erie buoy array, water temperature was highly synchronous across space while DO, turbidity, chlorophyll and phycocyanin were not (search abstract). — [PMC11884689](https://pmc.ncbi.nlm.nih.gov/articles/PMC11884689)
- In Lake Mendota transects, horizontal heterogeneity tended to exceed vertical heterogeneity even without surface scums (abstract). — [ESA 2011 abstract](https://eco.confex.com/eco/2011/webprogram/Paper31755.html)
- In Esthwaite Water (small temperate lake), all variables showed small-scale patchiness, and chlorophyll-a depended significantly on fetch (via search abstract). — [NERC Open Research Archive](https://nora.nerc.ac.uk/id/eprint/16750/)
- Rotsee late-summer lateral temperature gradients were ~5 × 10⁻⁴ °C/m (~0.5 °C/km). — [Doda et al. 2022](https://hess.copernicus.org/articles/26/331/2022/)
- At Lake Monger the surface at the bed centre was 0.4 °C warmer than the bed edge on one date; on another, open water was slightly warmer than the bed. — [Vilas et al. 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5727088/)

**Zooplankton**
- Windermere (240-m resolution high-speed sampling): water temperature, as a proxy for lake-wide circulation, explained 29–47 % of basin-scale spatial variance in *Daphnia galeata*. The patterns are highly dynamic with the weather, so single surveys mislead. George & Winfield (2000) found lake-wide zooplankton distributions controlled by wind-induced basin currents interacting with each species' depth selection. — [NERC NORA 511223](https://nora.nerc.ac.uk/id/eprint/511223)
- Diel horizontal migration (DHM): zooplankton in shallow lakes often move from open water into the littoral (macrophytes) by day to avoid fish and return at night. The macrophyte–open-water boundary can be the shelter zone (Lauridsen & Buenk 1996). Littoral refuges also house other predators. Most evidence comes from cold north-temperate lakes. — [Limnetica 35(2):281 review (PDF)](https://mail.limnetica.org/documentos/limnetica/limnetica-35-2-p-281.pdf); costs and benefits framework: [Burks, Lodge, Jeppesen & Lauridsen 2002, Freshw. Biol. 47:343 (DOI)](https://doi.org/10.1046/j.1365-2427.2002.00824.x)
- Taxon-specific DHM in Sulejów Reservoir (Poland): large daphnids and copepods swam toward open water at dusk and toward submerged macrophytes at dawn. *Bosmina* and *Chydorus* showed no horizontal pattern. Juvenile roach and perch in the littoral had large zooplankton in their stomachs (via search summary). — [RCIN digital library record](https://rcin.org.pl/dlibra/publication/91627/edition/117553/content)
- Counter-examples:
  - in an Argentine temperate lake, zooplankton avoided the shore (higher predation risk there) (search summary) — [CONICET record](https://repositoriosdigitales.mincyt.gob.ar/vufind/Record/CONICETDig_a69639c2ea4becfcc7b19226b18adc31);
  - in shallow brackish lakes with plant-dwelling predators, DVM dominated over DHM — [FAO AGRIS record](https://agris.fao.org/search/fr/records/68879c7b7fd4d06c32a982fe)

**Resuspension and turbidity**
- Wind waves dominate resuspension in shallow lakes. A common model computes wave height and period from wind, fetch and depth per cell, then bottom orbital velocity and shear stress, and resuspends where shear exceeds τ_cr. — [Finnish archipelago wave–resuspension study, EGUsphere 2025-2936](https://egusphere.copernicus.org/preprints/2025/egusphere-2025-2936/egusphere-2025-2936-manuscript-version6.pdf)
- That study measured τ_cr ≈ 0.49 N/m² for mud, 1.56 for sand and 1.02 for mixed, with ~30–50 % biological variability. These are coastal sediments; soft organic lake muds are likely weaker. — [same source](https://egusphere.copernicus.org/preprints/2025/egusphere-2025-2936/egusphere-2025-2936-manuscript-version6.pdf)
- Håkanson's dynamic ratio DR = √(area, km²)/mean depth (m): higher DR means wind and waves control sedimentation more. Fine cohesive material accumulates in open deep water; coarser deposits and erosion/transport bottoms dominate the shallows. — [Estonian small-lakes paper (Proc. Est. Acad. Sci. Biol. Ecol. 2005)](https://kirj.ee/wp-content/plugins/kirj/pub/biol.ecol-1-2005-171-189_20211101093235.pdf); [USBR Salton Sea appendix](https://www.usbr.gov/lc/region/saltnsea/finalreport/Vol1/App1G.pdf)
- Depositional boundary depth in Lake Memphremagog: log DBD (m) = −0.107 + 0.742 log F (km) + 0.0653·slope (%) (Rasmussen & Rowan 1997). — [Sytsma lecture](https://web.pdx.edu/~sytsmam/limno/Limno09.10.Motion.pdf)

### Inferences
**Resuspension in Hot Brook.**
- DR is ≈ √3.6/3.35 ≈ 0.57 (Upper) and √2.77/2.74 ≈ 0.61 (Lower) — high.
- DBD with F = 3 km and a 1 % slope: log DBD = −0.107 + 0.742·0.477 + 0.065 ≈ 0.31, so DBD ≈ 2 m. With the long-axis fetch, the bed above ~2 m is likely erosion/transport bottom and only the deep basins (Upper's north basin, Lower's saucer centre) accumulate organic mud.
- Implement per-cell resuspension with a fetch-by-wind-direction table, depth-limited wave orbital velocity, and a τ_cr of order 0.05–0.5 N/m² (a calibration knob). Settle in calm weather.
- This also sets where `sedOM` accumulates (focusing to the deep basins).

**Horizontal heterogeneity the model must carry beyond temperature:**
- littoral vs pelagic O₂ and metabolism (benthic primary production, plant beds);
- chlorophyll pushed downwind or into gyre convergences;
- zooplankton patchiness from DHM plus wind transport — a behavioural horizontal flux toward plant cells at dawn and away at dusk, scaled by fish predation risk;
- turbidity from shallow-cell resuspension.

Temperature can be nearly uniform in the open water (synchronous), but use shallow-cell overheating (weed beds) by day and overcooling by night.

### Gaps
- No north-temperate small-lake study was found giving numeric littoral-minus-pelagic temperature or DO contrasts on a diel cycle.
- No quantitative DHM fluxes (fraction of *Daphnia* moving, distances) were retrieved.
- No published τ_cr was found for organic, gyttja-like lake sediments like Hot Brook's.

---

## 4. River inflow and outflow: plume behaviour, through-flow, regional residence times, the brook, under-ice inflow

### Takeaway
Inflow fate depends on the inflow-to-lake density difference: lighter water spreads as a wind-mixed overflow, denser water plunges into an underflow or interflow. The plunge region extends offshore roughly the inflow's densimetric Froude number times its width. In a wind-mixed shallow lake the inflow signal is mostly confined to a near-field plume and the through-flow path. Coves and bays have their own much shorter, wind-set water ages. Under ice, inflow effects stay largely confined to the flow path, but stream mouths can be late-winter O₂ refuges.

### Cited Findings
**Plume physics**
- A lighter inflow forms a buoyant overflow whose mixing is strongly affected by wind. A heavier inflow pushes ambient water ahead to a plunge point and becomes an underflow; with stratification, an interflow.
- Plunge-region theory: offshore extent of the plunge region ÷ river width ≈ initial densimetric Froude number Fr_d = U₀/√(g′H). This matched observed plunge locations better than earlier models. — [Hogg et al. 2014, "The flow of rivers into lakes" (Cambridge repository)](https://www.repository.cam.ac.uk/handle/1810/245315)
- From a search summary of the plunging-flow literature (exact paper-to-number mapping not verified):
  - Fr_d at the plunge line is typically 0.3–0.6 in constant-width channels;
  - plunging entrains ambient water, with one energy-based framework limiting entrainment to ≤ ~40 % of inflow and diverging-channel tests showing 0–45 %;
  - a dense underflow isolated from wind mixing keeps its own temperature, nutrients, O₂ and turbidity.
  
  — [Thorez 2022 (TU Wien, PDF)](https://repositum.tuwien.at/bitstream/20.500.12708/150185/6/Thorez-2022-From%20inflow%20to%20interflow%2c%20through%20plunging%20and%20lofting%20uncover...-ao.pdf); [Energy dissipative plunging flows, J. Hydraul. Eng.](https://ascelibrary.com/doi/10.1061/%28ASCE%29HY.1943-7900.0000176); [Negatively buoyant flow in diverging channel IV, J. Hydraul. Eng. 1989](https://ascelibrary.com/doi/10.1061/%28ASCE%290733-9429%281989%29115%3A4%28437%29)
- In Lake Geneva, wind-driven upwelling that reaches the inflow area homogenises temperature, turning the Rhône's thermocline interflow into an intrusion spread over the whole column. Large/deep lake. — [EPFL record 286372](https://infoscience.epfl.ch/record/286372)

**Residence and water age**
- Whole-lake residence time mostly reflects the main basin's volume. Embayments can differ, and only small near-bottom pockets of bays hold water older than a week (Lake George). — [Lake George water-age study](https://par.nsf.gov/biblio/10499031)
- Water age can be treated as a transported tracer (advection–diffusion with upwind schemes). This approach was used in a 2-D depth-integrated model of through-flow and wind exchange in a shallow reed-fringed lake, with 3-D for semi-enclosed bays. — [Józsa et al. 2001, IAHR](https://www.iahr.org/library/info?pid=23120)
- In Eau Galle Reservoir, littoral (not tributary) P inputs were 15 % of measured P input, so internal lateral transport rivals inflow loading. — [James & Barko 1993 (USGS)](https://pubs.usgs.gov/publication/1003402)

**Under ice**
- River inflows can affect under-ice flow, but their effect is usually confined to the flow path (citing Kirillin et al. 2012). — [Kirillin et al., HESS 22:6493 preprint discussion (2018)](https://hess.copernicus.org/articles/22/6493/2018/)
- In Upper Red Rock Lake (Montana) during hypoxic winters, the upper 1 m and areas near stream mouths stayed well oxygenated into late winter. DO showed considerable horizontal variability and a non-linear depletion rate, and the lake re-oxygenated lake-wide 2–4 weeks before ice loss. An earlier thesis (Gangloff 1996) found O₂ refugia off the mouths of Red Rock and Grayling Creeks. — [Davis et al. 2020, Hydrobiologia 847:3983](https://link.springer.com/article/10.1007/s10750-020-04382-z); [Montana State ScholarWorks](https://scholarworks.montana.edu/items/d104b528-078a-448b-8e22-0137d7c60c64)
- A 1991 Wyoming reservoir study listed small shallow lakes, prolonged snow and ice, lack of surface-water inflow and high productivity as factors associated with winterkill. This is via search summary; the link between that finding and this URL is uncertain. — [BioStor scan](https://archive.org/download/biostor-239088/biostor-239088.pdf)

### Inferences
**Hot Brook inflow and outflow.**
- In open water the summer inlet stream is usually cooler (denser) than the warm shallow lake. It should briefly plunge along the bed in the south basin, then be mixed out by wind within the near field, a few hundred metres at most.
- In autumn it can be warmer and float.
- Model this as a source cell (or a short sequence of cells along the thalweg) that receives the inflow at the density-appropriate layer, then let the lake's advection and diffusion carry it. Add an outflow sink cell in the north basin.
- Through-flow should run south → north along the deepest path, with coves isolated from it.

**Residence times.**
- Upper ~100 d and Lower ~55 d are whole-lake means.
- Coves have wind-set ages of a few days. The south-to-north through-flow channel is "younger" than the means; the deep north basin of Upper may be older near the bottom in calm spells.
- Carry a water-age tracer (cheap: one more scalar field) to check this and to drive the visual "inflow plume" (colour, turbidity) emergently.

**The 154-m brook** is a one-way upper-to-lower conveyor. It should carry Upper's outflowing surface or near-surface water (temperature, plankton, drifting larvae, O₂) into Lower's south end as Lower's main inflow. Wind setup differences between basins of order a few cm are tiny next to the brook's gradient, so treat flow as one-way (my judgement; no source).

**Under ice.**
- Inflow at ~0–1 °C is lighter than the ~4 °C bottom water, so it should spread under the ice near the inlet. The effect stays near the flow path and gives an oxygenated plume — the stream-mouth refuge that ice-anglers know.
- The Upper→Lower brook water enters Lower's south end the same way.
- This physical reasoning (0–4 °C density anomaly) is mine. The confinement to the flow path and the stream-mouth refuges are sourced above.

### Gaps
- No small-lake (≤ 5 m) inflow-plume field study was found with plume lengths or mixing distances.
- No study of residence-time distribution by region in a small shallow lake with through-flow was found.
- No under-ice inflow-plume measurements in a lake like Hot Brook were found.
- Monsen et al. 2002 (definitions of flushing time vs age) was not retrieved.

---

## 5. Ice: freeze-up and ice-out pattern, snow, under-ice circulation (sediment heating, radiative convection), O₂ depletion patterns

### Takeaway
Under ice the lake is wind-sheltered. Early winter ("Winter I") is driven by sediment heat (1–4.5 W/m², larger in shallow water). This warms near-bed water toward 4 °C, which slides down-slope; the lateral heat transport from shallows to deeps is as large as the vertical fluxes. Currents are a few mm/s and seiche-like in small lakes. After snow melts in late winter ("Winter II"), sunlight drives convection under the ice (w* 1–7 mm/s; the mixed layer deepens 0.5–3 m/day) for 2–7 weeks, mixing phytoplankton and often raising O₂. O₂ demand is areal (sediment), so shallow coves deplete fastest per volume. Stream mouths and the near-ice layer stay oxygenated. Within-lake freeze-up and ice-out order is poorly documented.

### Cited Findings
**Under-ice regimes and currents**
- Kirillin et al. (2012) divided ice cover into Winter I (sediment heat flux drives circulation right after ice-on; Likens & Ragotzkie 1965) and Winter II (radiatively driven convection later in winter; Farmer 1975), with wind and inflows adding effects. At ice onset the column becomes inversely stratified (0 °C over warmer water). — [Lake Massawippi study, Aquatic Sciences 2024 (Springer)](https://link.springer.com/doi/10.1007/s00027-024-01044-3)
- In small lakes (smaller than the Rossby radius) oscillating flows dominate under-ice turbulence throughout the ice season; in large lakes density currents dominate. Under-ice mixing was traced to whole-lake barotropic oscillations driven by wind on the ice. — [Kirillin et al. 2018, HESS 22:6493](https://hess.copernicus.org/articles/22/6493/2018/)
- Lake Vendyurskoe (Karelia; thermistor stations 7.6 m and 11.5 m deep):
  - under-ice currents were weak, a few mm/s, with seiche-like character (likely ice-cover oscillations);
  - isotherms were nearly horizontal, with no conditions for large-scale density currents;
  - sediment-to-water heat flux was 0.6–2.0 W/m², decreasing with depth; water-to-ice flux 0.7–1.2 W/m², roughly doubling once solar heating began;
  - spring daytime net flux at the ice–water interface was ~7.7 W/m². — [Bengtsson et al. 1996, L&O 41:1502](https://portal.research.lu.se/en/publications/field-investigation-of-winter-thermo-and-hydrodynamics-in-a-small/)
- Three small shallow ice-covered lakes:
  - sediment heat flux was the main heat source in early and mid-winter: 1–4.5 W/m² early, 0.5–3 W/m² late, varying with depth;
  - ice–water flux ~0.5–1 W/m²;
  - lateral heat transport from shallow to deep areas was of the same order as the vertical fluxes and should be included in predictions;
  - lateral salt flux shallow→deep was of the same order as the sediment salt flux. — [Malm et al. 1997, Nordic Hydrology 28:129](https://www.lunduniversity.lu.se/lup/publication/b3f163a6-59a4-4248-bd11-ecac5c3280c1)
- Heating at the lateral margins below 4 °C produces down-slope gravity currents, a central upwelling return, and a lake-wide anticyclonic gyre of 2–4 cm/s, in polar Lake Kilpisjärvi (Finland). That lake is much larger and deeper than the target; this characterisation is from general knowledge, not the source. — [Kirillin et al. 2015, GRL (UTAS eCite)](https://ecite.utas.edu.au/101290)
- The same group's 2014 abstract reported a peak azimuthal velocity of 0.05 m/s. It noted that warm water from an open-water "moat" along the shore converges down-slope, and that meltwater inflow adds marginal heating, possibly accelerating ice melt. — [EGU2014-2387 abstract](https://opac.geologie.ac.at/ais312/dokumente/EGU/EGU2014-2387.pdf)
- 3-D modelling: at bottom heat fluxes above ~1 W/m², a counterflow from sediment heating can fully replace the diffusion-driven boundary circulation. Rotation organises the flow into gyres. — [Sharifi, Hinkelmann, Hattermann & Kirillin 2025, Environ. Fluid Mech. (UiT Munin)](https://munin.uit.no/handle/10037/36675)

**Radiatively driven convection**
- After snow leaves the ice, volumetric solar heating of < 4 °C water drives convection beneath a thin stable diffusive layer under the ice. Observed w* ≈ 1–7 mm/s and convective mixed-layer deepening of 0.5 m/day, up to 3 m/day under strong sun and weak background stratification.
- Convection keeps non-motile phytoplankton suspended and triggers early under-ice growth (Vehmaa & Salonen 2009). Differential littoral–pelagic heating under ice can drive large-scale circulation.
- Lake-specific temperature of maximum density: TMD ≈ 3.98 °C at the surface. — [Bouffard & Wüest 2019](https://infoscience.epfl.ch/record/264776)
- Vendyurskoe: spring under-ice convection lasted 2–7 weeks, with chlorophyll fairly evenly spread through the convective layer, even below the photic zone. — [EGU21-9741 abstract](https://meetingorganizer.copernicus.org/EGU21/EGU21-9741.html)
- Vendyurskoe, 2007–2020:
  - early ice-on years lost > 50 % of O₂ by winter's end; late ice-on years lost < 40 %;
  - thinning spring snow and ice let in more light and started convection earlier;
  - long convection raised O₂ 10–15 % at the end of ice cover, mainly by phytoplankton photosynthesis. — [Zdorovennova et al. 2021, Water 13:2435 (DOAJ)](https://doaj.org/article/6ccabc9fbdeb4da2ad3c490f9d5654d0)

**O₂ depletion rates and patterns**
- Average in-situ under-ice depletion was ~0.2–0.39 g O₂ m⁻² d⁻¹ in three shallow Arctic lakes (9–13 m max depth), vs 0.03–0.14 in 24-m Toolik Lake. Rates were higher in smaller lakes (larger sediment-area : volume) and fell to 20–50 % of initial values in late winter. — [Schwefel et al. 2023, L&O (OpenPolar record)](https://openpolar.no/Record/crwiley:10.1002%2Flno.12357)
- Winter SOD in Upper Mississippi backwater lakes was 0.04–0.44 g O₂ m⁻² d⁻¹ at in-situ temperatures. — [USGS data release](https://www.usgs.gov/data/winter-sediment-oxygen-demand-and-sediment-characteristics-pools-4-8-and-13-upper-mississippi)
- In shallow lakes, clear (macrophyte) lakes had lower winter O₂, more frequent anoxia and higher depletion rates. Depletion rates correlated positively with peak summer macrophyte biomass. — [Rabaey et al., "Differing winter oxygen regimes in clear and turbid shallow lakes" (ESS Open Archive)](https://essopenarchive.org/users/551439/articles/604372-differing-winter-oxygen-regimes-in-clear-and-turbid-shallow-lakes)
- In 20 northern Alaskan lakes, depth and littoral area explained most late-winter DO variation. Low-DO regimes were typical of shallow lakes with large littoral areas. Longer ice cover meant lower DO, and snow depth mattered in shallow lakes. — [Leppi, Arp & Whitman 2016, Environ. Manage. 57:463 (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4712229)
- Stream mouths and the upper 1 m as O₂ refuges, plus lake-wide re-oxygenation 2–4 weeks before ice loss: see Q4. — [Davis et al. 2020](https://link.springer.com/article/10.1007/s10750-020-04382-z)

**Freeze-up and ice-out spatial pattern** (weak evidence)
- Freeze-onset dates in shallow Arctic coastal-plain lakes (< ~3.5–4 m) varied more (up to 26 days) than melt-onset (12 days) or clear-of-ice dates (6 days). Ice timing depends mainly on air temperature, with wind, snow and lake size and depth also contributing. — [Remote Sensing 2015, 7:6133 (Alaska SAR)](https://mdpi-res.com/d_attachment/remotesensing/remotesensing-07-06133/article_deploy/remotesensing-07-06133-v2.pdf); [Natural Resources Canada: lake ice SAR](https://natural-resources.canada.ca/maps-tools-publications/satellite-elevation-air-photos/mapping-monitoring-lake-ice-sar-satellites)
- In a Swiss lake-ice webcam log, one entry notes the outflow area starting to melt first. — [Integrated monitoring of ice in selected Swiss lakes, arXiv 2008.00512](https://arxiv.org/pdf/2008.00512)

### Inferences
**O₂ budget for Hot Brook.** Using the areal depletion rate (0.2–0.39 g m⁻² d⁻¹), volume-specific depletion goes as rate/depth:
- ~0.06–0.12 mg L⁻¹ d⁻¹ at the 3.35-m mean;
- 0.2–0.4 mg L⁻¹ d⁻¹ in 1-m coves.

Over ~145 days of ice, coves would go anoxic within 1–2 months without lateral exchange, while the mean column would lose ~9–17 mg/L. That is enough for late-winter hypoxia, consistent with "early ice-on years lose > 50 %".

**Lateral exchange under ice is required.**
- A per-column 1-D under-ice model will over-deplete shallow coves and under-deplete the deep basin.
- Add a lateral exchange that moves sediment-warmed (denser, toward 4 °C), low-O₂ near-bed water from shallow cells down-slope into deeper cells, with compensating flow toward the shallows near the ice. Malm et al. found this lateral flux "of the same order" as vertical fluxes.
- A simple form is a down-slope bottom-layer flux ∝ the horizontal density difference between adjacent cells' bottom layers, capped at mm/s speeds.

**Spring.** When snow cover goes, switch on radiative convection under the ice: a mixed layer deepening 0.5–3 m/day. This mixes the whole 3–5-m column in 1–10 days in a tea-coloured lake. Brown water absorbs shortwave in the top metre, so the deepening rate will be at the lower end — my inference from colour ~46 Pt-Co. Let it lift phytoplankton, re-oxygenate (sourced: +10–15 % O₂, re-oxygenation 2–4 weeks before ice-out), and let ice-out follow.

**Ice geometry** (spatial order not well sourced):
- ice should form first over shallow coves and sheltered bays (less heat to lose, less wind) and last over the deep, windy north basin of Upper;
- ice-out should start as a shoreline moat, at the inlet and outlet, and over shallow sediments that release stored heat.

A per-cell ice model (thickness from a degree-day or energy balance, with per-cell heat content) produces this emergently, without scripting. Snow cover on ice should gate under-ice light (Winter I → II switch).

### Gaps
- Kirillin et al. 2012 full text was not retrieved, so numbers come from citing papers.
- No source documented within-lake ice-on and ice-off order for a small north-temperate lake. The shallow-first freeze and moat-first melt are physically reasoned plus one polar abstract and one webcam note.
- No measured under-ice O₂ contrast between shallow coves and the deep basin of the same small lake was found. Red Rock Lake shows horizontal variability and refuges but full numbers were not retrieved.
- Snow-ice (white ice) effects on light were not quantified here.

---

## 6. How 3-D and simplified models represent these processes; grids, time steps, and the cheapest approximations that keep the behaviour

### Takeaway
Full 3-D lake models (ELCOM/AEM3D, Delft3D, Si3D, MIKE 3, FVCOM) are hydrostatic, use z- or sigma-layers, and run with a constant, grid-dependent horizontal diffusivity at grids from ~5 m (a 68-ha lake) to 500 m (Lake Erie) and time steps from 30 s to 5 min. They are far too expensive for a browser at real-time compression. The cheap, behaviour-preserving route has three parts:
- keep the existing 1-D vertical physics per column;
- couple columns with:
  1. a depth-averaged wind-driven flow from precomputed linear basis fields, plus a parameterised two-layer drift and return;
  2. a grid-scale horizontal diffusivity (~0.01–0.05 m²/s);
  3. parameterised density-driven exchanges (night thermal siphon, under-ice down-slope flow);
- add canopy and ice switches.

Multi-basin 1-D models with gravitational exchange reproduce sub-basin thermal structure ~300× faster than 3-D.

### Cited Findings
**Full 3-D models**
- ELCOM (the hydrodynamic core of AEM3D) is a free-surface, z-level, hydrostatic RANS model on an Arakawa C-grid. Sufficient resolution is properly demonstrated by a grid-convergence run at twice the resolution. — [Hodges, ELCOM methods](https://www.caee.utexas.edu/prof/hodges/site2006/documents/elcom_methods.pdf)
- In ELCOM and Delft3D-Flow, vertical mixing uses a turbulence model, while horizontal mixing uses a prescribed constant horizontal dispersion coefficient. Published lake grids range from ~50 m to several km. Because 3-D models resolve vertical shear, their horizontal coefficient should exclude vertical shear dispersion and depend on grid size. — [Peeters & Hofmann 2015](https://kops.uni-konstanz.de/bitstream/123456789/32231/3/Peeters_0-309524.pdf)
- Example configurations:
  - ELCOM for a 68-ha shallow lake with macrophytes: 5 m × 5 m grid, 0.1 m layers, 30 s step, canopy drag C_D = 1, 7-day runs, RMSE 0.93 °C — [Vilas et al. 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5727088/)
  - AEM3D for Lake Erie: 500 m grid, 45 layers of 0.5–5 m, 5-min step — [Queen's coastlines lab](https://coastlines.engineering.queensu.ca/?p=1125)
  - Delft3D-FLOW for 0.4-km², 4.5-m-mean Lake Créteil, calibrated over one month against five-depth temperature (search summary) — [MDPI Water 12:814](https://www.mdpi.com/2073-4441/12/3/814/htm)
- Si3D uses an efficient semi-implicit finite-difference algorithm. In Clear Lake (large, polymictic) it matched observations at several sites without extensive calibration and quantified basin-to-basin exchange. — [Rueda & Schladow 2003](https://produccioncientifica.ugr.es/documentos/618fa3394fa218568b4e09e1?lang=en); [EPA abstract](https://cfpub.epa.gov/ncer_abstracts/index.cfm/fuseaction/display.abstractDetail/abstract_id/5976/report/F)
- 3-D lake models need time-consuming, often trial-and-error calibration; an automated framework was tested on Lake Geneva and Greifensee. — [EPFL record 280037](https://infoscience.epfl.ch/record/280037)

**Simplified and intermediate models**
- MB-DYRESM (multi-basin DYRESM): 1-D Lagrangian vertical layers per sub-basin plus a horizontal algorithm for gravitational mass exchange between adjacent sub-basins. It reproduced sub-basin thermal structure and mass distribution comparably to a parallel 3-D model, ~300× faster, and did better when stratification suppressed turbulence. — [Zhou, Imberger & Marti 2021, Environ. Model. Softw. 143:105099](https://research-repository.uwa.edu.au/en/publications/a-new-pseudo-three-dimensional-hydrodynamic-model-with-lagrangian/)
- 2-D depth-averaged shallow-water models are standard for very shallow lakes:
  - Lake Neusiedl: finite-volume MUSCL-Hancock scheme on a quadtree mesh with wind–current interaction and non-uniform wind stress — [Krámer & Józsa 2005, Periodica Polytechnica](https://www.pp.bme.hu/ci/article/view/575)
  - a Ypacarai Lake model treats wind as a velocity-dependent force term and bed friction by Manning's equation (search summary). Some simpler variants keep only wind and bottom stress, dropping Coriolis and turbulence; that variant's paper was not pinned down. — [Ypacarai Lake model (DOAJ)](https://doaj.org/article/e343ae7501624440b8bc815b2c1c6d71)
- In a NOAA GLERL 2-D lake system, particles move with the vertically averaged current plus a fraction of the surface wind. — [NOAA repository 11207](https://repository.library.noaa.gov/view/noaa/11207)
- PCLake has an optional wetland/marsh zone exchanging water with the lake. A PCLake study tested raising the marsh share and the marsh–open-water exchange rate as management levers, noting that littoral↔open-water exchange had never been measured directly. — [PCLake marsh-zone modelling study, Environ. Manage. 2008](https://link.springer.com/doi/10.1007/s00267-008-9121-7); [Wikipedia: PCLake](https://en.wikipedia.org/wiki/PCLake)
- 1-D lake models (FLake, GLM, GOTM, Simstrat, MyLake) are run in ensembles via LakeEnsemblR. — [ISIMIP GOTM entry](https://www.isimip.org/impactmodels/details/205/)
- A Canadian multi-column lake scheme mixed horizontally between columns weighted by ice-cover fraction, with simple ice redistribution. FLake's parametric profile makes fractional ice cover harder. — [Martynov, Lake 2008 presentation](https://netfam.fmi.fi/Lake08/Presentations/Presentation_Martynov.pdf)

### Inferences
**A recommended architecture for Hot Brook**, my synthesis. Every rate is anchored to Q1–Q5.

**1. Grid.**
- 50 m columns give ~1,440 (Upper) + ~1,110 (Lower) ≈ 2,550 wet columns.
- 25 m gives ~10,000, which is likely too many for a 30-Hz JS loop that also runs ~600 fish brains.
- Layers of 0.3–0.5 m give ≤ 11–18 layers in Upper's deepest column.
- Coves narrower than ~3 cells will not resolve. Mark them as "littoral pockets" with a sub-grid exchange (item 5).

**2. Vertical.** Reuse the existing 1-D column physics per cell: wind-mixed layer, night convection, under-ice inverse stratification, O₂ with sediment demand, N/P/phyto/zooplankton. Wind mixing should use per-cell fetch and depth, and be suppressed under canopy (Q2) or ice.

**3. Depth-averaged wind-driven flow from two precomputed basis fields.**
- For steady, linear, friction-dominated depth-averaged flow (no Coriolis, no advection): transport U = (H/r)(τ/ρ − gH∇η), with ∇·U = 0.
- Writing U = k̂ × ∇ψ, this reduces to the elliptic problem ∇·((r/H²)∇ψ) = curl(τ/(ρH)), with ψ = 0 on each lake's shore.
- For a uniform wind the forcing is (1/ρ)(∇(1/H) × τ)·k̂: vorticity is generated where depth varies across the wind. This produces exactly the documented downwind-in-shallows, upwind-in-the-deeps double gyre (Q1).
- Because the equation is linear in τ, solve it once per lake for τ = x̂ and τ = ŷ (one Poisson solve each on ~2,500 cells, offline or at load). At run time, ψ(t) = τ_x ψ_x + τ_y ψ_y.
- Relax the live flow toward this target with a time constant H/r ≈ 5–10 h (Rotorua: ~6-h reversals).
- This is exactly "precompute per wind direction", reduced to two fields by linearity. It is my derivation from the classic Csanady/Bennett topographic-gyre setting; check signs and the friction value r ≈ 1e-4 m/s against a short 3-D benchmark if possible.

**4. Vertical structure of the drift.**
- Superimpose a two-layer shear: a surface drift u_s ≈ 0.03·U10 decaying as exp(−z/(H/3)) (Q1), with the same transport removed from the lower layers so the column transport still equals ∇ × ψ.
- This gives the near-bottom return flow, downwind transport of floating and near-surface material (and of buoyant larvae and plankton), and upwind return of bottom material — the observed George/Windermere-type zooplankton steering.
- Upwelling at the upwind shore of a diurnal thermocline follows automatically once W ≪ 1.

**5. Density-driven exchanges (parameterised, not resolved).**
- *Night thermal siphon.* When B₀ > 0 (cooling) and |L_MO|/h < 0.5 (weak wind), exchange between each littoral cell and its deeper neighbour. Use q = 0.34 (B₀L)^{1/3} h_lit per metre of edge, as a bottom-layer outflow plus a surface-layer return. Time scale is hours (Rotsee 7–20 h; Hot Brook estimate ~5 h).
- *Daytime heating.* A weaker reverse siphon.
- *Under ice.* A down-slope bottom-layer flux driven by adjacent-cell bottom-density differences (sediment-heated water toward 4 °C), mm/s speeds, plus a shore return under the ice.

**6. Horizontal diffusion.** K_h ≈ 3.6e-4·Δx^1.07 (≈ 0.024 m²/s at 50 m), explicit. Check stability: Δt ≤ Δx²/(4K) ≈ 26,000 s at 50 m, so it is never limiting.

**7. Advection of scalars.**
- Use first-order upwind or a flux limiter on the 2-D C-grid — Józsa et al. use upwind for water age.
- Advective CFL with u ≤ 0.1 m/s and Δx = 50 m allows Δt ≤ 500 s of lake time. A semi-Lagrangian step removes even that limit.
- Mass conservation holds if fluxes are computed on faces and debited from the source (matches the repo's closed P/N budgets).

**8. What not to do explicitly.** Do not step the free-surface gravity wave. With c ≈ 7 m/s at 5.5 m and Δx = 50 m, explicit stability needs Δt ≲ 5–7 s of lake time. At the sim's diel compression (a 60-s day ≈ 1440× real time), one 1/30-s frame is ≈ 48 s of diel lake time.
  - Use the rigid-lid/diagnostic ψ approach (item 3) or a semi-implicit free surface (Si3D-style).
  - Represent seiches (≈ 19 min) and setup (≈ 3 cm), if wanted, as a cosmetic analytical surface tilt and oscillation for rendering only.

**9. Time-base caution.** The repo runs two clocks: a diel day of 60 s and a year of 1800 s (one real day ≈ 4.9 s). Transport time scales in lake time differ by orders of magnitude:
- night siphon ~5–20 h;
- gyre spin-up ~6–10 h;
- cove flushing ~1–3 days;
- residence 55–100 days.

Decide explicitly which clock drives horizontal transport. For example, flushing and residence on the seasonal clock, siphons and gyres keyed to the diel phase. The seasonal clock compresses time ~17,520× and the diel clock ~1,440×, so choosing the wrong one makes water exchange wrong by ~12× one way or the other. This is my observation from CLAUDE.md's time table, not from a source.

**10. Biology hooks** that need these fields:
- weed-bed cells with damped flow and diel O₂ extremes (Q2);
- littoral benthic metabolism (~40 % of GPP and R) (Q3);
- DHM as a behavioural horizontal flux for zooplankton (Q3);
- resuspension per cell from fetch and wind (Q3);
- inflow source and outflow sink with a water-age tracer (Q4);
- per-cell ice with snow-gated under-ice light, sediment heat and lateral under-ice exchange (Q5).

**Validation targets:**
- Q2: littoral flushing in hours on calm autumn nights;
- Q3: shallow > deep metabolism, and DO variability largest in weed beds;
- Q5: late-winter low O₂ in coves and the deep north basin's bottom, oxygenated stream mouths, and re-oxygenation weeks before ice-out.

### Gaps
- No published comparison was found of a "1-D columns + precomputed wind basis + parameterised exchange" lake model against a full 3-D model. MB-DYRESM is the nearest analogue, and it uses sub-basins, not a fine grid.
- No AEM3D or Si3D application to a lake of Hot Brook's size and depth was found that gives its grid, time step and horizontal diffusivity. Lake Monger (5 m grid) and Lake Créteil (configuration not retrieved) are the closest.
- The linear bottom-friction coefficient r for the diagnostic gyre model was not sourced (estimated ~1e-4 m/s from C_D ≈ 2.5e-3 and u_b ≈ 5 cm/s). It should be tuned so spin-up is a few hours.
- No GLM, MyLake or FLake multi-box coupling specifics were retrieved.
- MIKE 3 and FVCOM small-lake applications were not examined.
