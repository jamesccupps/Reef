# Super-individual fish IBMs at whole-lake scale: worth, interactions, movement, reproduction/evolution, school sizes

Context: Hot Brook (Upper 360 ha + Lower 277 ha) at ~2,600 fish ≥ 7.5 cm per ha is about 1.6 million fish. The engine budget is about 1,000–3,000 brain-driven agents at 30 steps/s. YOY are already super-individual "schools" (`world.fry`). These notes collect what the literature says about representing the remaining ~1.6 M fish with a few thousand agents.

Where the full text was read (not just the abstract): Scheffer et al. 1995, Parry & Evans 2008, the OSMOSE and Ev-OSMOSE documentation sources, Huse & Fiksen 2010, Strand et al. 2002, Huse et al. 1999, Gras et al. 2009 (EcoSim), the inSTREAM 5.0 description, Shima et al. (SDM preprint), Teunissen & Ebert 2014, Niwa 2004, and the Rose (2018) and Creekmore (2014) slide decks.

---

## 1. The super-individual method: how worth (n) is handled, how many SIs give stable statistics, known artefacts, and splitting/merging rules

### Takeaway
Give every agent an internal number n (its "worth") and route every loss through n:
- binomial draws when n is small, real-valued n when it is large;
- conditional mortality (e.g. starvation) as a partial loss per day, not death of the whole agent.

Then a few hundred SIs per cohort reproduce full-IBM growth and mortality to about 1% in a well-mixed system (Scheffer et al. 1995). The method degrades badly in spatially explicit, density-dependent models once each SI stands for more than about 10 individuals (Parry & Evans 2008). The fixes are:
- compute densities from Σn, never from agent counts;
- avoid whole-SI death;
- keep enough SIs per cell, through per-cell resampling, splitting and merging.

### Cited Findings

**Scheffer et al. 1995 (the original paper)**
- **The problem it solves.** Reducing the number of model individuals leads to "loss of variation, irregular dynamics, and large sensitivity to the value of random generator seeds". The fix is one extra attribute per model individual, "the number of real individuals it actually represents". This lets one formulation zoom from individual-by-individual (n = 1), to a cohort representation, to "all-animals-are-equal" (one SI per cohort) — [Scheffer et al. 1995, full text](https://pure.uva.nl/ws/files/2866149/761_6900y.pdf)
- **Small subsets fail in specific ways.** A small random subset truncates trait distributions (outliers such as large individuals vanish). It makes outcomes seed-dependent. Its demographic noise also "tends to prevent the manifestation of point, cyclic or strange attractors" that appear with large numbers — [Scheffer et al. 1995](https://pure.uva.nl/ws/files/2866149/761_6900y.pdf)
- **Very low survival needs rescaling.** When early-life survival is very low (≪1% in many fish), the initial numbers needed are huge unless the scaling is adjusted over time. Groups with very different densities (predators vs prey) are hard to scale together. One older trick was to follow the abundant group in a smaller "hypothetical subspace" (Scheffer's Fig. 2a) — [Scheffer et al. 1995](https://pure.uva.nl/ws/files/2866149/761_6900y.pdf)
- **Creating SIs at reproduction ("fusing").** The pragmatic rule is to sample a random subset of the newborns and give each an internal amount equal to the inverse of the sample fraction. The more sophisticated rule clusters similar individuals: the internal amount is the cluster size and the state is the cluster centroid (cites the Stage et al. 1993 aggregation algorithm). In the striped-bass test each SI started with S_i = T/N (T = total first-feeding larvae, N = number of SIs), sampled from each female's egg cohort in proportion to its survivors — [Scheffer et al. 1995](https://pure.uva.nl/ws/files/2866149/761_6900y.pdf)
- **Background mortality.** Draw the number of survivors from Binomial(n, p) instead of n Bernoulli draws. Their recursive sampler:
  - P0 = (1−p)^n, then P_x = P_{x−1}·(n−x+1)p / (x(1−p)), accumulated until Σ > r;
  - when np > 5, use a normal approximation (mean np, sd √(np(1−p)));
  - with n = 1 this reduces exactly to the classic Bernoulli IBM.

  — [Scheffer et al. 1995](https://pure.uva.nl/ws/files/2866149/761_6900y.pdf)
- **Deterministic or hybrid n.** Treating n as a real number and multiplying it by the survival fraction removes stochasticity entirely. Scheffer's examples use a hybrid: real-valued at high n, switching to stochastic draws only below some n threshold. This keeps essential small-number stochasticity at high speed — [Scheffer et al. 1995](https://pure.uva.nl/ws/files/2866149/761_6900y.pdf)
- **Conditional (e.g. starvation) mortality.** Killing the whole SI when the condition is met assumes all members are identical, which is unrealistic. The alternatives are a fixed high mortality probability while the SI stays in the danger state, or a fractional loss. In the consumer-cohort example, an SI in starvation mode lost 10% of its internal amount per day. Once S_i fell below 1, extinction was a daily Bernoulli(0.1) draw, matching the individual model's 0.1/day starvation death. Starvation mode began at >25% weight loss — [Scheffer et al. 1995](https://pure.uva.nl/ws/files/2866149/761_6900y.pdf)
- **Consumer-cohort accuracy and speed.**
  - 500 individuals: the size distribution deteriorated quickly over successive die-off cycles.
  - 10,000 individuals: postponed the problem, but runtime went from 6 min to more than 2 h (486 PC).
  - 10 SIs: under 1 minute while "preserving a smooth pattern in the size distribution".

  — [Scheffer et al. 1995](https://pure.uva.nl/ws/files/2866149/761_6900y.pdf)
- **Striped-bass accuracy.** The full run had about 200,000 larvae (209,992 / 195,311 / 178,177 for three seeds). The paper states that "even if the 200000 individuals are represented by as few as 20 super-individuals the deviation from the full individual-by-individual simulation is only about 2%". That is more than three times as accurate as the Rose et al. (1993) resampling method, at slightly lower cost. Table 2 (mean absolute % deviation over 3 seeds):

  | Model individuals | Growth, SI | Growth, resampling | Mortality, SI | Mortality, resampling |
  |---|---|---|---|---|
  | 10,000 | 0.2 | 0.1 | 0.4 | 0.8 |
  | 1,000 | 0.2 | 0.8 | 0.2 | 0.4 |
  | 500 | 0.3 | 1.7 | 0.6 | 2.0 |
  | 100 | 0.4 | 2.6 | 0.8 | 2.9 |
  | 20 | 2.1 | 7.4 | 1.6 | 4.9 |

  I rebuilt this table from garbled PDF text extraction. The mortality columns check out against the raw rates in Table 1. — [Scheffer et al. 1995](https://pure.uva.nl/ws/files/2866149/761_6900y.pdf)
- **Caveat on that test.** It was a single well-mixed compartment (700 m × 700 m × 4 m), daily step, first-year larvae and juveniles only. Prey were fixed density fields; there was no explicit predator SI eating prey SI — [Scheffer et al. 1995](https://pure.uva.nl/ws/files/2866149/761_6900y.pdf)

**Rose, Christensen & DeAngelis 1993 (fixed number of model individuals / resampling)**
- **The method.** Mortality removes a whole model individual. To keep the count constant, the dead slot is refilled with a copy of a randomly chosen survivor, and the survivor's worth is split between the original and the clone. Scheffer et al. note that this cloning "by definition" decreases diversity in the simulated set. The loss is minor when the set is large and clones diverge quickly through stochastic experiences — [Scheffer et al. 1995 (describing Rose et al. 1993)](https://pure.uva.nl/ws/files/2866149/761_6900y.pdf)
- **Accuracy.** In the young-of-year striped bass test, runs with and without resampling differed by under 1.5% of the mean values for a set of variables, with lower memory needs — [Rose, Christensen & DeAngelis 1993, Ecol. Modell. 68:273–292 (abstract)](https://doi.org/10.1016/0304-3800(93)90022-K)

**Parry & Evans 2008 (spatially explicit, density-dependent aphid IBM)**
- **Three ways to handle SI mortality** (after Grimm & Railsback 2005, p. 267):
  1. a constant number of SIs, with mortality reducing N;
  2. N kept roughly constant: mortality reduces N, and SIs are recombined when N falls below N0/2;
  3. the whole SI dies when mortality strikes.

  Parry used (3) for speed. They call it "the least biologically realistic" and note it may need a lower N to avoid "excessive discretization of mortality" — [Parry & Evans 2008, full text](https://eprints.whiterose.ac.uk/id/eprint/4129/1/evansa1.pdf)
- **Density from Σn.** Density-dependent equations must use the real number of individuals, not the number of SIs. Example: the alate-morph proportion ALPROP = 0.002 + 0.991/(1 + exp(−0.076·(DENSITY − 67.416))), with DENSITY = aphids per plant — [Parry & Evans 2008](https://eprints.whiterose.ac.uk/id/eprint/4129/1/evansa1.pdf)
- **Results.**
  - Below 10,000 individuals the SI runs diverged temporally. They peaked earlier, and only "10,000 individuals with 1,000 super-individuals (scale factor 10)" fell within the individual model's range.
  - Spatially, SIs clustered: the regional total density was similar, but dispersal patterns differed clearly.
  - Once each SI represents more than ~10 individuals, aggregate statistics "can hide more detailed deviations".
  - Their conclusion: the approach suits only cases with many individuals and a low scale factor.

  — [Parry & Evans 2008](https://eprints.whiterose.ac.uk/id/eprint/4129/1/evansa1.pdf)
- **Fixes they proposed:**
  1. weighted dispersal kernels around a central SI;
  2. relocating a percentage of the SIs in a cell without redistributing population;
  3. a cell population model with individual migration;
  4. trying mortality rules (1)/(2) instead of whole-SI death.

  They warn that spatial heterogeneity (not tested; neutral landscape) may make errors worse — [Parry & Evans 2008](https://eprints.whiterose.ac.uk/id/eprint/4129/1/evansa1.pdf)
- **Speed and memory.** SIs always improved speed and memory. With 500,000 agents, memory could fall to ~1% of the individual model at a scale factor of 10,000 — [Parry & Evans 2008](https://eprints.whiterose.ac.uk/id/eprint/4129/1/evansa1.pdf)

**Variable worth, per-cell resampling, splitting/merging**
- **Hellweger 2008 (planktonic microbes).** A fixed representative number gives low resolution wherever and whenever density is low. Earlier methods fixed the global SI count by letting worth vary in time, which handles temporal but not spatial gradients. Hellweger's fix gives each spatial segment its own SI population, resampled when its count leaves user-set bounds or when the variance of worths exceeds a threshold — [Hellweger 2008, Computers & Geosciences (abstract)](https://catalog.comses.net/publications/1587)
- **Same paper, intro.** At low SI numbers, results become seed-sensitive and non-reproducible. The worst case is artificial "numerical extinction", when density falls below that needed for one SI — [Hellweger 2008 (ScienceDirect abstract)](https://www.sciencedirect.com/science/article/abs/pii/S0098300407000647)
- **Teunissen & Ebert 2014 (adaptive particle management, plasma physics; the general weighted-particle method).**
  - Merge pairwise with nearest neighbours in state space, found with a k-d tree, within a distance d_max ∝ grid spacing. Merged weight = w_i + w_j.
  - The new position (state) is either the weighted average, which biases the distribution toward cluster centroids, or that of one parent picked at random with probability ∝ weight. The random pick is unbiased on average and preserves the distribution's shape.
  - Process candidates from low to high relative weight (current/desired).
  - Splitting: two copies with weights ⌊w/2⌋ and ⌊(w+1)/2⌋. Identical copies are fine only if later random events separate them; otherwise jitter position or velocity.

  — [Teunissen & Ebert 2014, arXiv:1301.1552](https://arxiv.org/pdf/1301.1552)
- **Schwenkel et al. 2018 (cloud superdroplets).**
  - Without splitting, only runs with 500–1,000 superdroplets per grid box reproduced the reference.
  - Splitting clones a superdroplet into η_spl copies with weight A/η_spl. It runs only while the box holds fewer than N_P,max superdroplets.
  - Starting from 87 per box, splitting with up to 150 per box was enough to converge.
  - Merging happens only in inactive (non-cloudy) boxes, for small-weight particles, and conserves mass.

  — [Schwenkel, Hoffmann & Raasch 2018, GMD 11:3929](https://gmd.copernicus.org/articles/11/3929/2018/)

**Population-size choices in real fish SI models**
- **Calanus IBM (Huse).** The whole Norwegian Sea population of *C. finmarchicus* was represented by about 30,000 SIs. Its herring predator SIs had only a position and an internal number, and their feeding was not explicit — [Huse & Fiksen 2010](https://bio.uib.no/te/papers/Huse_2010_Modelling_encounter.pdf)
- **Barents Sea cod–capelin IBM.** Survey age/length/abundance became 20,000 SIs per species, described as giving "a highly realistic structure of the populations" — [Huse & Fiksen 2010](https://bio.uib.no/te/papers/Huse_2010_Modelling_encounter.pdf)
- **Gulf of Mexico croaker IBM.**
  - 20,000 SIs per age class, maximum age 8, starting from 6 million age-1 and 10 million age-2+ fish.
  - 140-year runs with 40-year spin-up; 12 replicates.

  — [Creekmore et al. 2014 workshop slides](https://www.northerngulfinstitute.org/gulf-hypoxia/workshops/2014/presentations/Creekmore-Sean-Hypoxia-Effects-on-Fish-Populations.pdf)
- **Rose's movement test-bed.** 3,000 SIs with an initial worth of 100 fish each — [Rose 2018 PICES slides](https://dev.pices.int/Publications/Presentations/PICES-2018/S7-1400-Rose.pdf)
- **OSMOSE.** The number of schools created per species per time step at reproduction (N_s) is a user parameter. Without explicit SIs the total number of fish (eggs to adults) "can reach a value of the order of 10^12" — [OSMOSE reproduction submodel (source)](https://raw.githubusercontent.com/osmose-model/osmose/master/doc/odd_des/submodel/reprod.qmd); [OSMOSE ODD description](https://osmose-model.org/wp-content/uploads/2025/01/Osmose-ODD-Description.pdf)

### Inferences
- **Scale factor is unavoidable.** 1.6 M fish over 1,000–3,000 agents means a mean n of about 500–1,600, roughly 50–150× above Parry's "≲10" comfort zone. Whole-SI death and density-from-agent-count are therefore out. Every density-dependent rule must read Σn per cell (crowding, scramble competition, schooling attraction, predator satiation, angler catch). This mirrors the sim's existing `world.fry` scramble-competition logic.
- **Mortality rule for brain agents.** Use Scheffer's hybrid:
  - real-valued n for continuous hazards (starvation, hypoxia, heat, background M) when n is large;
  - Binomial(n, p) once n drops below ~20–50 (a judgement call);
  - death of the agent (brain removed) only when n reaches 0.

  This is also the only option that keeps a brain-driven agent alive through partial losses. A school losing 30% of its members to a pickerel is not a dead brain.
- **Determinism.** Scheffer's recursive binomial sampler and the normal approximation (np > 5) are cheap, deterministic given the seeded `core.rand`, and exactly the classic IBM at n = 1.
- **Number of agents per cohort.** Scheffer's numbers (100 SIs → <1% error in growth/mortality; 20 → ~2%) are for a well-mixed compartment. Spatial, density-dependent dynamics need more (superdroplets: 150–1,000 per interacting cell). With ~3,000 agents over ~640 ha there will usually be only a handful of agents per interaction cell. So pairwise agent-agent encounter statistics will be noisy. The robust design computes per-cell aggregate fields (Σn·mass per species and size class) and lets interactions draw on those fields (see Q2).
- **Merging and splitting must respect genomes.** With per-agent neural genomes, merging must not average genomes or weights (Teunissen's weighted average would produce a non-functional "centroid brain"). Use the probabilistic rule: keep one parent's genome with probability ∝ n, and set n = n_i + n_j. Allow it only between same-species, same-size-class agents in the same cell, ideally siblings that share a genome. Splitting a large agent gives clones (⌊n/2⌋, ⌈n/2⌉) with jittered position. Clones add agents but no genetic diversity (Rose 1993 / Scheffer caveat).
- **Per-region agent budgets.** Hellweger-style budgets per region (e.g. per basin, or Upper / brook / Lower) prevent the brook and the shallow Lower basin from being represented by too few agents. Resample a region when its agent count leaves [min, max] bounds.

### Gaps
- No full text found for Rose et al. 1993 (exact resampling equations) or Hellweger 2008 (the resampling thresholds actually used).
- No fish-specific convergence study (SI count vs. error) in a spatial, multi-species predator–prey IBM was found. The available numbers come from a well-mixed larval model (Scheffer), aphids (Parry) and cloud physics (superdroplets).
- A search snippet mentioned a coupled copepod IBM "robust to the number of super-individuals given that this is above about 50,000". I could not identify its source with confidence, so it is not used.
- Grimm & Railsback (2005) p. 267, the source of the three-option mortality list, was seen only as cited by Parry & Evans.

---

## 2. How spatially explicit lake/reservoir/marine fish IBMs compute encounters, feeding and competition between super-individuals

### Takeaway
The dominant scheme (OSMOSE) does not pair SIs individually. Each predator school sees all accessible prey biomass in its cell (the size-ratio window × accessibility). It eats min(available, capacity), where capacity = predator biomass × Imax per sub-step. The eaten biomass is split across prey schools in proportion to their accessible biomass. Predation success then drives growth and starvation.

Order bias is controlled by randomising schools × mortality sources over several sub-steps. Where pairwise SI events are needed, the superdroplet Monte Carlo rule is the rigorous template: random non-overlapping pairs, probability scaled up, and min(n_j, n_k) real pairs interacting. Competition is either scramble (shared per-cell resource pools) or hierarchical (inSTREAM: largest fish deplete cell resources first).

### Cited Findings

**OSMOSE (the explicit predation algorithm)**
- **Who can be eaten.** Predation is opportunistic. It depends on horizontal co-occurrence in a grid cell, a predator/prey length window R_max < L_pred/L_prey ≤ R_min (so L_prey ∈ [L_pred/R_min, L_pred/R_max)), and an accessibility coefficient for vertical mismatch. That coefficient is "not to be used to define diet preferences". The food web "emerges from local predation and competition interactions" — [OSMOSE predation submodel (source)](https://raw.githubusercontent.com/osmose-model/osmose/master/doc/odd_des/submodel/mort/pred.qmd)
- **The equations** — [OSMOSE predation submodel (source)](https://raw.githubusercontent.com/osmose-model/osmose/master/doc/odd_des/submodel/mort/pred.qmd):
  - B_avail = Σ_prey A(pred, prey)·B_prey
  - B_eatable = B_pred·I_max / N_mort, with I_max in g food per g fish per year and N_mort the number of mortality sub-steps (per time step)
  - B_eaten = min(B_avail, B_eatable)
  - success rate S_R += B_eaten/B_eatable
  - each prey loses B_eaten·A·B_prey/B_avail, converted to dead fish (nDead)
  - "It is assumed that predator eat as much as they can"
- **Resource (plankton) groups.** These are size ranges, not schools. A predator takes the fraction of a resource that overlaps its size window: R_rsc = [min(L_max,rsc, L_max) − max(L_min,rsc, L_min)] / (L_max,rsc − L_min,rsc) — [OSMOSE predation submodel (source)](https://raw.githubusercontent.com/osmose-model/osmose/master/doc/odd_des/submodel/mort/pred.qmd)
- **Starvation.**
  - N_starv = N·(1 − e^(−M_starv)), with M_starv = M_max·(1 − S_R/C_SR) when S_R ≤ C_SR.
  - It uses the previous step's predation success.
  - Parameters: `mortality.starvation.rate.max.sp#`, `predation.efficiency.critical.sp#`.

  — [OSMOSE starvation submodel (source)](https://raw.githubusercontent.com/osmose-model/osmose/master/doc/odd_des/submodel/mort/starv.qmd)
- **Order bias.** Within a time step, each school × mortality-source pair is handled in random order. All mortality events are iterated over a fixed number of sub-steps (`mortality.subdt`), so that random order "does not bias the resulting instantaneous mortality rates" — [OSMOSE mortality submodel (source)](https://raw.githubusercontent.com/osmose-model/osmose/master/doc/odd_des/submodel/mort.qmd)
- **Sensing and scale.**
  - Schools "know perfectly all the potential prey which are located in its vicinity, i.e. in the same cell".
  - The time step is weekly to monthly.
  - Applications usually include 10–20 focal species.
  - Schools share species, age, size, food requirements and position.

  — [OSMOSE ODD description](https://osmose-model.org/wp-content/uploads/2025/01/Osmose-ODD-Description.pdf)

**Encounter-based IBMs**
- **Barents Sea cod–capelin.** Consumption of capelin "emerges from simulating encounters between the two species"; growth uses bioenergetics models.
  - Grid: 90 × 100 squares at 20 km; 20,000 SIs per species.
  - Mortality and growth are "emergent properties resulting from local encounters".
  - Purely reactive movement produced "very aggregated distributions" and fitted observations poorly.

  — [Huse & Fiksen 2010](https://bio.uib.no/te/papers/Huse_2010_Modelling_encounter.pdf)
- **Feeding rate form.** The standard form is Holling's disk equation; encounter rates are light- and visual-range-dependent. They suggest a predator–prey vertical overlap index (0–1) multiplying the horizontal predator density as a cheap substitute for explicit 3-D co-location — [Huse & Fiksen 2010](https://bio.uib.no/te/papers/Huse_2010_Modelling_encounter.pdf)
- **Oneida Lake yellow perch–walleye IBM (Rose et al. 1999).** It follows the daily growth, mortality and spawning of individuals of each species through their lifetime. It was configured from the Oneida long-term database and tested for compensatory density-dependent growth and survival of YOY. Encounter equations were not retrieved — [Rose et al. 1999, Ecol. Monogr. 69:127–154 (abstract)](https://www.osti.gov/biblio/345120)
- **Lake Mendota.** Rose & McDermot's model follows daily feeding, growth, movement, reproduction and mortality of up to six species for multiple generations in up to three spatial boxes — [catalog record](https://catalog.comses.net/publications/98785)
- **PISCATOR (Netherlands lakes).** A multispecies lake IBM with eight interacting fish species by default, size-dependent predation, fisheries, piscivorous birds and a simple zooplankton/benthos food representation. It is cited elsewhere as an SI model — [PISCATOR project page](https://projectenaew.wur.nl/piscator/info/introduction.html); [van Nes et al. 2002 record](https://catalog.comses.net/publications/100886)
- **Striped bass larvae** (inside Scheffer's test). The daily proportion of Cmax realised was "determined based on stochastic prey encounters" with multiple zooplankton and benthic prey density groups (fields, not SIs) — [Scheffer et al. 1995](https://pure.uva.nl/ws/files/2866149/761_6900y.pdf)
- **Croaker IBM.** It deliberately had "no food web interactions". Food was a chlorophyll multiplier from a water-quality model — [Creekmore et al. 2014 slides](https://www.northerngulfinstitute.org/gulf-hypoxia/workshops/2014/presentations/Creekmore-Sean-Hypoxia-Effects-on-Fish-Populations.pdf)
- **California Current sardine/anchovy.** Feeding cues used P = C/Cmax with a Holling type III response to NEMURO zooplankton fields. An albacore-like predator was included as individuals that consumed anchovy and sardine SIs — [Rose 2018 PICES slides](https://dev.pices.int/Publications/Presentations/PICES-2018/S7-1400-Rose.pdf); [UAF end-to-end project page](https://www.uaf.edu/cfos/research/projects-archived/end-to-end-fish-model/)

**Pairwise interaction between multiplicity-weighted particles (cloud physics, directly portable)**
- **Shima's Super-Droplet Method (SDM)** — [Shima et al. 2007/2009 preprint, arXiv physics/0701103](https://arxiv.org/pdf/physics/0701103v1):
  - In each cell, form ⌊n_s/2⌋ random non-overlapping pairs from a random permutation, giving O(n_s) cost instead of O(n_s²).
  - Scale each pair's probability by [n_s(n_s−1)/2]/⌊n_s/2⌋.
  - An event between SIs of multiplicity ξ_j ≥ ξ_k makes min(ξ_j, ξ_k) real pairs interact: ξ_j −= ξ_k and k's state changes.
  - If p > 1, multiple events per pair are allowed (γ = ⌊p⌋ or ⌊p⌋+1).
  - The time step should keep p < 1.
- **Equivalence to the individual model.** With all multiplicities = 1, SDM is the individual-by-individual model. Accuracy is tuned by the initial number of super-droplets — [Shima et al. preprint](https://arxiv.org/pdf/physics/0701103v1)

**Competition**
- **inSTREAM (stream trout).**
  - Competition is exploitative under a length-based hierarchy.
  - Each cell holds a limited daily food supply (drift and search food) and a fixed area of velocity shelter.
  - Actions run "one fish at a time, in descending order of fish length".
  - When a fish moves into a cell, "the resources it uses are subtracted from those available for subsequent fish".
  - A drift-regeneration distance keeps food per area independent of cell size, so food is not "an artifact of cell size".

  — [inSTREAM 5.0 model description](https://humboldt.edu/sites/default/files/ecological-modeling/2024-09/instream5-0modeldescription.pdf)
- **Scheffer's consumer cohort (pure scramble).** All SIs drew from one logistic food pool: F_{t+1} = F_t + g_max·F_t·(K − F_t)/K − ΣC_i. Here ΣC_i must sum n_i·C_i over SIs — [Scheffer et al. 1995](https://pure.uva.nl/ws/files/2866149/761_6900y.pdf)

### Inferences
- **Recommended predation rule: field-based OSMOSE-style.** Each simulation step (or a coarser "ecology tick", e.g. 1 s of sim time), build per-cell tables of prey biomass by species × length bin from Σ(n·mass) of agents and fry schools. A predator agent then eats:

  > eaten = min( Σ_prey A·B_prey·[size window], n_pred·Cmax_FB4·dt·f(T) )

  Distribute the eaten amount over prey agents ∝ their accessible biomass, convert it to deaths (real n or binomial at small n), and credit n_pred × per-capita intake to the predator's gut. This plugs straight into the sim's existing FB4 `Cmax` and gut model. It is order-independent if done over shuffled sub-steps (OSMOSE `mortality.subdt`), and deterministic with `core.rand`.
- **The brain's role.** The brain then sets where the agent is and its strike/flee/hide state (which multiply A, the accessibility, and the predator's search rate). It does not decide individual prey captures. This keeps learned behaviour meaningful while the demography stays SI-correct.
- **Alternative when a visible "strike" must kill visible prey.** Treat a strike as an SDM event between predator agent j and prey agent k. Prey removed = min(n_j·k_per_strike, n_k), where k_per_strike ≈ 1 for piscivores swallowing one fish (Shima's min(ξ_j, ξ_k) rule). Predator satiation is capped by n_j·gut capacity. Scale strike probability so that the expected kill rate equals the field-based rate; otherwise a 200-fish perch school "hit" by a 5-fish pickerel agent loses either 5 or 200 fish, both wrong.
- **Cannibalism falls out of the size window** (yellow perch, smallmouth, chain pickerel, bullhead), applied within a species across length bins. Never let an agent eat itself: same-agent members share one length in the SI representation.
- **Use Huse's overlap index for depth.** The lakes are ≤5.5 m and unstratified, so a per-cell vertical-overlap coefficient (light- and depth-dependent) is a cheap substitute for full 3-D co-location of agents. Reserve true 3-D positions for rendering and for the brain's senses.
- **Competition.** Keep scramble competition (shared per-cell zooplankton and benthos pools, already fields in this sim) as the default. Add inSTREAM-style size-ordered depletion only where interference is documented (e.g. sunfish in the brook pools). Iterate agents in descending length within a cell so larger fish deplete first.

### Gaps
- The Oneida Lake IBM's actual predator–prey encounter algorithm (how walleye SIs remove perch SI worth, cannibalism handling) was not retrieved. Only the abstract was available.
- Rose et al. 2015 (Prog. Oceanogr. 138:348–380) was not retrieved: its full SI predation algorithm and its handling of the albacore predator's consumption of SIs are unknown.
- The PISCATOR SI implementation details are unknown; the technical report could not be downloaded.
- OSMOSE default values for `mortality.subdt`, I_max, C_SR and N_s were not found in the documentation sources read. Published OSMOSE applications would need checking.
- I found no paper that documents a specific "predation artefact" arising from SI pairing in fish IBMs. The analysis above is inference, backed by Parry's density artefacts and the SDM formulation.

---

## 3. Movement on a grid in 2-D/3-D: habitat-quality gradients, restricted-area search, kinesis/taxis, habitat selection; time steps and cell sizes

### Takeaway
Fish IBM movement is usually one of four families, all of the form X(t+1) = X(t) + V(t):
- restricted-area search (RAS: move toward the best cell within a radius);
- kinesis (velocity = inertial + random, both modulated by how far local habitat quality is from optimal);
- event-based;
- run-and-tumble.

Plus Railsback's state-dependent habitat selection (move daily to the reachable cell maximising expected survival × growth-to-maturity over a ~90-day horizon). RAS, kinesis and event-based transfer to novel environments; run-and-tumble does not. Time steps range from ~2 s (ELAM near dams) through 5 min to 1 h for regional models. Cells range from ~1–5 m² (stream, test-bed) to 1–20 km (shelf seas).

### Cited Findings

**Comparisons of movement sub-models (Watkins & Rose)**
- **2013.** RAS, kinesis, event-based and run-and-tumble were compared in a small-pelagic-fish cohort IBM on a 2-D grid, trained by a genetic algorithm in one environment and tested in three others. All except RAS and event-based generalised well; those two needed training gradients similar to the test environment. Run-and-tumble gave near-random distributions except under the steepest gradient — [Watkins & Rose 2013, Ecol. Modell. 250:214–234 (abstract)](https://ideas.repec.org/a/eee/ecomod/v250y2013icp214-234.html)
- **2014.** RAS, kinesis and event-based gave higher egg production than random walk across spatiotemporal resolutions. Kinesis and run-and-tumble did better when habitat quality changed more between steps; RAS and event-based did better with small changes — [Watkins & Rose 2014, TAFS (abstract)](https://catalog.comses.net/publications/93633)
- **2017 and the dissertation.** The 2017 paper extended the comparison to dynamic prey and predator fields — [Watkins & Rose 2017, Ecol. Modell. 356:59–72](https://ideas.repec.org/a/eee/ecomod/v356y2017icp59-72.html). The dissertation's recommendation: choose by the sub-model's assumptions, the species' observed movement, the gradient shape and steepness, and the model's resolution; calibrate in dynamic conditions if it will be used in them — [Watkins 2012 dissertation](https://repository.lsu.edu/gradschool_dissertations/3139/)

**Rose's 2018 test-bed** — [Rose 2018 PICES slides](https://dev.pices.int/Publications/Presentations/PICES-2018/S7-1400-Rose.pdf). Transcribed from slides; the typesetting is partly garbled, so verify symbols against Watkins & Rose 2013 before use.
- **Set-up.** Grid 540 × 540 cells of 5 m², 5-minute step, 30-day "generation", 3,000 SIs, initial worth 100 fish, initial length 73.3 mm.
- **Growth and mortality.**
  - Growth G = Gmax·G_r,c.
  - Mortality per 5 min M = Mmax·M_r,c·M_L, with M_L = 1 − (L − 73.3)/(Lmax − 73.3).
  - S(t+1) = S(t)·e^(−M).
- **GA calibration.** 3,000 strategy vectors; each generation selects parents with P ∝ egg production E_i/ΣE; mutates 6% of parameters by ±0.25.
- **RAS.**
  - Rank cells within radius D_hood by Q = (1−α)(G + noise) − α(M·M_L + noise).
  - Head toward the best cell at speed SS plus a random term, with a random heading perturbation.
  - The GA evolves α, R, R_dist and D_hood.
- **Kinesis** (Humston-style).
  - V = f (inertial) + g (random).
  - f_x = V_x(t−1)·H1·exp[−0.5((Q−Q_opt)/σ_Q)²].
  - g_x = ε_x·(1 − H2·exp[−0.5((Q−Q_opt)/σ_Q)²]).
  - Q = (1−α)G − αM·M_L.
  - The GA evolves Q_opt, α, H1, H2 and σ.
  - So near-optimal habitat → persistence plus little random motion; poor habitat → random search.
- **Original kinesis model (Humston et al. 2000, tuna).** Speed combines a habitat-scaled previous speed with a random term tied to a maximum sustained speed of about 5 body lengths/s; slide-listed coefficients are H1 = 0.75, H2 = 0.9, H3 = 0.5. My reconstruction from a poorly typeset slide is uncertain — [Ito 2011 PICES slides](https://dev.meetings.pices.int/publications/presentations/PICES-2011/2011-S8/S8-1005-Ito.pdf); [Humston 2012 PICES slides](https://dev.pices.int/publications/presentations/PICES-2012/2012-S8/S8-0905-Humston.pdf)

**Applied models (time steps, grids)**
- **Croaker (Gulf of Mexico).**
  - Hourly growth, mortality, reproduction and movement on a 300 × 800 grid of 1-km cells.
  - X/Y velocities are computed hourly from the temperature response, with inertia + random components.
  - If DO < 2.0 mg/L, the fish searches 80 cells for temperature closest to T_opt with DO > 2.0.
  - Hydrodynamics: FVCOM+WASP at 1–10 km horizontal, 0.2–2.0 m vertical.

  — [Creekmore et al. 2014 slides](https://www.northerngulfinstitute.org/gulf-hypoxia/workshops/2014/presentations/Creekmore-Sean-Hypoxia-Effects-on-Fish-Populations.pdf); [Rose et al. croaker Part 1 record](https://scholarworks.utrgv.edu/eems_fac/78/)
- **Sardine/anchovy end-to-end.** ROMS at 10 km with 42 levels and a 900 s step; 50-year runs (1959–2009). Kinesis cues: temperature (Gaussian) and feeding P-value (C/Cmax, Holling III) — [Rose 2018 PICES slides](https://dev.pices.int/Publications/Presentations/PICES-2018/S7-1400-Rose.pdf)
- **ELAM ("Numerical Fish Surrogate", juvenile salmon at dams).** An Eulerian hydrodynamic/water-quality frame, a Lagrangian frame for perception and trajectories, and an agent frame for decisions. Virtual fish decide about every 2.0 s, producing sub-metre to metre-scale moves from hydraulic stimuli. Calibration adjusts rules until tracks match observed fish — [Goodwin et al. 2006, Ecol. Modell. 192:197–223 (catalog)](https://catalog.comses.net/publications/50757)

**Habitat-selection rules (Railsback)**
- **Expected maturity.** The 1999 rule: maximise expected survival × closeness to reproductive size — [Railsback et al. 1999, Ecol. Modell. 123:73–89 (catalog)](https://catalog.comses.net/publications/70312). Tested against six observed trout habitat patterns; it beat "maximise growth" and "maximise survival" — [Railsback & Harvey 2002, Ecology 83:1817–1830 (catalog)](https://catalog.comses.net/publications/9071)
- **inSTREAM implementation** — [inSTREAM 5.0 model description](https://humboldt.edu/sites/default/files/ecological-modeling/2024-09/instream5-0modeldescription.pdf):
  - **Formula.** expectedMaturity = nonstarvSurvival × starvSurvival × fracMature, all over the horizon T = `fishFitnessHorizon`:
    - nonstarvSurvival = (today's daily survival from non-starvation risks)^T;
    - starvSurvival comes from projecting today's growth over T;
    - fracMature = projected length / spawning length (≤ 1).
  - **Daily move.** The fish moves to the best cell within maxMoveDistance = A·L^B (example A = 20, B = 2). The doc's examples: < 2 m at 3 cm, 5 m at 5 cm, 30 m at 10 cm, 80 m at 20 cm. With these parameters the formula gives about 20 m at 10 cm, so the doc's 30 m looks inconsistent.
  - **Gradients, not targets.** Fish can climb a gradient detectable within that distance but cannot target anything beyond it.
  - **Horizon length.** Horizons of 5–10 d make the rule almost pure survival; ~100 d makes it almost pure growth. Population success was insensitive between ~70 and 120 d.
  - **Cell size.** Recommended cells are larger than the area one adult trout occupies (~1 m²).
- **Huse cod–capelin rules.** Rule 2: pick the best of the 9 neighbouring squares by a fitness proxy. Capelin minimise cod biomass/growth (Werner & Gilliam μ/g), cod maximise capelin biomass. Rule 3: move only when local fitness is below the domain average. Rule 3 was closest to observations; purely reactive search over-aggregated — [Huse & Fiksen 2010](https://bio.uib.no/te/papers/Huse_2010_Modelling_encounter.pdf)
- **OSMOSE.** Schools are redistributed each step by a random walk within a species/age distribution area. The area comes from distribution maps or a contiguous `ncell` patch, with `movement.randomwalk.range` adjacent cells per step — [OSMOSE ODD description](https://osmose-model.org/wp-content/uploads/2025/01/Osmose-ODD-Description.pdf)

### Inferences
- **The brain already provides taxis/kinesis-like steering.** Two rules from the literature map onto it. Kinesis (persist when habitat is good, randomise when it is poor) is a good baseline or prior for brainless SI cohorts (fry schools, small-bodied forage). Railsback's expected-maturity score is a candidate shaping signal or "fitness proxy" sensor (the sim's Baldwinian learning could reward Δ expected maturity).
- **Two clocks are justified.** Fish brains decide at 30 Hz (finer than ELAM's 2 s). The demographic and SI bookkeeping (mortality draws, merges/splits, per-cell biomass tables) can run on a coarser tick (e.g. 1 sim-second or one `BIOE.DAY`). Rose's test-bed used a 5-min step with 5 m² cells; the croaker model 1 h with 1 km cells.
- **A whole-lake 3-D grid of 0.3 m cells is unnecessary for ecology.** For interactions, a horizontal grid of ~10–50 m (a judgement call) over Hot Brook (~3.6 km² + ~2.8 km²) gives roughly 2,500–64,000 cells. That is comparable to the existing field grid's role, with a few depth layers (≤ 5.5 m). Encounter fields can use the same cells.
- **Movement radius scales with length.** Use inSTREAM's A·L^B, or a body-length-per-step cap, for SI agents. Large schools of small fish should not "teleport" across the lake to the best cell, while pickerel and bass have larger knowledge ranges.
- **Avoid pure greedy best-neighbour moves for all agents at once.** Huse found this produces unrealistically aggregated distributions. Keep stochasticity (kinesis-style random component) or the "move only if worse than average" rule.

### Gaps
- No primary full text for Humston et al. 2000 or Watkins & Rose 2013, so the kinesis equation coefficients above come from conference slides and need checking against the papers.
- No 3-D hydrodynamics-coupled freshwater lake fish IBM was found with retrievable movement details. Lake Erie larval yellow perch coupled-physical IBMs exist (Xia et al. 2014 GLFC report, too large to fetch; Gardner & Höök code on PURR), but specifics were not read — [Xia et al. 2014 GLFC report](https://www.glfc.org/pubs/pdfs/research/reports/Xiaetal_FinalProjectReport_2014_full.pdf); [Devanna, DuFour & Mayer 2015](https://www.utoledo.edu/nsm/lec/research/pdfs/Devanna_DuFour_Mayer2015.pdf)
- Nothing found on Lake Constance or Lake Ontario fish IBMs; not searched in depth.
- The Tyler & Rose 1997 habitat-selection rules were not retrieved.

---

## 4. Reproduction and genetics with super-individuals: creating offspring SIs, carrying genomes, diversity loss; evolving neural-network agents with SI counts

### Takeaway
The standard is one genome per SI, and every member of that SI is a genetically identical clone.
- **Creating offspring SIs.** Pool the eggs of a species per spawning step and split them into a fixed number N_s of new SIs (OSMOSE); or sample a subset and give each SI worth = 1/sample fraction (Scheffer).
- **Choosing parents.** Ev-OSMOSE draws the two parents of each new SI from all mature SIs, with probability ∝ that SI's total egg production (n × fecundity). Each parent contributes a meiotic gamete.
- **Effective population size.** It is bounded by the number of SIs (genomes), not by Σn. Drift and diversity loss are therefore governed by agent counts. GA-driven fish IBMs with ~2,000 individuals converged and lost most genetic variation within ~250–500 generations.
- **Prior art for neural brains.** The Bergen ING models (neural network + GA, used with SIs) are the closest precedent for neural-network fish with SI counts.

### Cited Findings

**OSMOSE (core)**
- **Egg production.** N_eggs = FRAC_fem·α·season·B_mat (α = relative fecundity in eggs per gram of mature female). If N_eggs < N_s, create one school of N_eggs; otherwise create N_s schools of N_eggs/N_s each. `simulation.nschool.sp#` sets N_s.
- **Seeding.** Seeding biomass is released for the first years and resumed if spawning stock collapses.

  — [OSMOSE reproduction submodel (source)](https://raw.githubusercontent.com/osmose-model/osmose/master/doc/odd_des/submodel/reprod.qmd)

**Ev-OSMOSE (eco-genetic OSMOSE)**
- **Parent choice.** Reproduction is panmictic: all mature individuals can mate "irrespective of their location and phenotype". When a new school is created, its two parents are drawn from a multinomial M(2, p), where p_i = N_eggs(i)/Σ_same-species N_eggs (relative fecundity of school i at the start of the breeding season).
- **Gametes.** Each parent forms a haploid gamete by picking one of its two alleles at random at each locus, with no linkage. The new school gets one allele per locus from each parent.

  — [Ev-OSMOSE genetic inheritance (source)](https://raw.githubusercontent.com/osmose-model/osmose/master/doc/evo_odd_des/submodel/genetic_inheritance.qmd)
- **Genetic architecture.**
  - Polygenic, multi-allelic, diploid, additive within and between loci.
  - Allelic values are drawn from N(0, σ²_A(0)/(2 l_Z)), so initial genotypic values are N(Ḡ, σ²_A).
  - Separate neutral loci (uniform allele identities) track drift.

  — [Ev-OSMOSE genetic structure (source)](https://raw.githubusercontent.com/osmose-model/osmose/master/doc/evo_odd_des/submodel/genetic_structure.qmd)
- **Phenotype.** Z(i) = G_Z(i) + e_Z(i), with expression noise e ~ N(0, σ²_e) drawn once at the school's birth. The four evolving traits are Imax, gonado-somatic index r, and the maturation reaction-norm intercept m0 and slope m1. Somatic mass, gonad mass, fecundity and maturation age emerge from bioenergetics under temperature and O₂ — [Ev-OSMOSE trait determinism (source)](https://raw.githubusercontent.com/osmose-model/osmose/master/doc/evo_odd_des/submodel/trait_determinism.qmd)
- **Initialisation and restart.**
  - Eggs are grouped into SIs, and each school gets a random diploid genotype drawn from the allele pools.
  - Seeding stops when ≥ 1 mature individual exists.
  - The initial allele pools must be saved as state for exact restart during seeding.
  - Model framing: individuals are diploid hermaphrodites (female-based life history).

  — [Ev-OSMOSE initialisation (source)](https://raw.githubusercontent.com/osmose-model/osmose/master/doc/evo_odd_des/init.qmd); [Morell et al. 2023 bioRxiv](https://www.biorxiv.org/content/10.1101/2023.02.08.527669)

**ING models (individual-based neural network + genetic algorithm; Bergen group)**
- **Huse et al. 1999.**
  - The ANN weights are the genome.
  - 2,000 individuals per generation; the best 10% are parents with 10 offspring each, and partners are drawn from the best 50%.
  - Single-point crossover with p = 0.5; otherwise the offspring is a clone of parent 1.
  - Mutation picks a hidden or output node with p = 0.1 and adds U[−1, 1] to all its incoming weights and bias.
  - Runs of 700–1,000 generations.
  - Known problems: getting stuck on local optima, and oscillatory ANN behaviour. They suggest a metapopulation (shifting-balance) as a remedy.

  — [Huse, Strand & Giske 1999, Evol. Ecol. 13:469–483](https://folk.uib.no/nfiof/NMA/Reading%20list/Huse%20Strand%20Giske%201999.pdf)
- **Strand et al. 2002 (emergent-fitness life-history model, *Maurolicus*).**
  - Depth ANN 5-20-1 (140 genes); separate juvenile and adult strings.
  - Reproduction is analogous to sexual: 60% chance of recombination with a partner (40% of offspring are clones apart from mutation).
  - Mutation 0.001 per character on the allocation/spawning strings; one mutation with p = 0.1 on the ANN string, never changing a value by more than 100%.
  - Population regulation: the GA raises external predation pressure whenever population exceeds 1,500 and lowers it if it falls below 400 after spawning. Initial and maximum population 2,000; 500 years; 5 replicates per scenario.
  - Characters converged by ~250 generations; "after 500 generations, genetic variation is reduced to a minimum".
  - Replicates reached the same behaviour, but with different allele frequencies (several equally fit networks).

  — [Strand, Huse & Giske 2002, Am. Nat. 159:624–644](https://folk.uib.no/nfiof/NMA/Reading%20list/Strand%20Huse%20Giske%202002.pdf)
- **ING with SIs at sea scale.** Bergen models combine SIs with GA-evolved strategies: Calanus with 5 strategy "genes", ~30,000 SIs. The authors note "IBMs have the advantage of being based on the same unit as natural selection" — [Huse & Fiksen 2010](https://bio.uib.no/te/papers/Huse_2010_Modelling_encounter.pdf)

**Artificial-life evolving-brain ecosystems (no SIs)**
- **EcoSim (Gras et al. 2009).**
  - Each agent's behaviour is a fuzzy cognitive map: about two dozen sensory, internal and motor concepts with weighted directed edges and persistent activation, i.e. memory. The vision memory holds the 5 closest items of each type. One offspring per mating, combining both parents' maps plus mutation.
  - Species = clusters within a speciation threshold of the species' average map; interbreeding requires map distance below a reproductive threshold.
  - Scale: up to 400,000 individuals and 500 species at once, at over 40 minutes per time step. The longest run took 2.5 months for 7,112 steps.
  - Cost is linear in agents for brains, but species re-clustering dominates.

  — [Gras et al. 2009, Artificial Life 15(4)](https://strathprints.strath.ac.uk/90261/1/Gras-etal-AL-2009-An-individual-based-evolving-predator-prey-ecosystem-simulation.pdf)

**Diversity loss under SI representations**
- Resampling by cloning (Rose et al. 1993) "by definition … leads to a decrease of diversity in the simulated set". The pure SI approach (worth decremented, no cloning) "avoids this side effect" — [Scheffer et al. 1995](https://pure.uva.nl/ws/files/2866149/761_6900y.pdf)

### Inferences
- **Effective population size equals the agent count.** Every SI is one genome, so Ne for brain evolution is at most the number of reproducing agents per species (tens to hundreds), not the ~10⁵ real fish of that species. Expect Strand-like convergence and loss of variation in a few hundred generations. For golden shiner (2nd-year maturity, ~2-yr generation) a few hundred generations is about 500–1,000 sim-years, i.e. roughly 10–20 days of continuous real time at 30 min per sim-year (less in fast-forward). For long-lived sucker and bass it is far longer. Mutation rate is the main counterweight; Ev-OSMOSE's neutral loci suggest tracking a neutral "marker gene" per agent to measure drift.
- **Offspring SI recipe for this sim** (extends the existing `world.fry` path):
  1. Per species and spawning event, pool eggs = Σ over mature agents of n_i·fecundity_i·(female fraction).
  2. Create N_s fry schools (e.g. 8–32 per species per spawning week; a judgement call).
  3. For each school, draw two parents from mature agents of that species with probability ∝ n_i·eggs_i (Ev-OSMOSE multinomial). Use spatial proximity (same basin or spawning ground) instead of panmixia to keep Upper/Lower differentiation possible.
  4. Build the child genome by crossover + mutation of the parents' `a.g` (the Baldwinian rule stays: `a.lw` is never inherited).
  5. Give the school worth n = pooled eggs / N_s.
  6. At recruitment, a fry school of worth n becomes one followed agent of worth n·survival.

  This keeps "1 per `FRY.N_PER_AGENT`" consistent with worth, but uses fewer, heavier agents.
- **Fitness under SIs.** Fitness is automatically n_survivors × per-capita fecundity. An agent whose brain keeps more of its school alive and fed contributes proportionally more offspring. That is correct selection on group-level behaviour, and it matches Ev-OSMOSE's parent-draw weighting.
- **Merge and split.**
  - Never merge agents with different genomes unless a genome is deliberately discarded. That is equivalent to killing it, so prefer merging only same-genome siblings from one fry school.
  - Splitting a big recruit cohort into several agents should create clones that then diverge only by experience (Baldwinian `a.lw`) and position.
  - Optionally, give split clones a small mutation as a pragmatic diversity source. This is a non-biological shortcut and should be stated as such.
- **Population control.** Strand's adaptive predation pressure is the ING analogue of the sim's IMMIGRATION/REFUGE mechanisms. Under SIs, a cleaner lever is to keep agent counts bounded by worth (merge or split) and leave real-number dynamics to the ecology.

### Gaps
- The Ev-OSMOSE preprint's parameter values (numbers of loci and alleles, N_s, number of schools, observed drift) were not retrieved; bioRxiv returned 429.
- Polyworld (Yaeger) was not researched. No numbers on its population sizes or brain sizes here.
- No published model was found that combines per-agent neural-network brains with a super-individual worth n for fish at whole-lake scale. ING-with-SI is the closest, and its SI handling of brain inheritance is not described in the papers read.
- Dunlop, Heino & Dieckmann 2009 (eco-genetic models): I could not confirm whether they use SIs or how they handle inheritance — [Dunlop et al. 2009 record](https://pure.iiasa.ac.at/id/eprint/8785/)
- Mate-finding artefacts specific to SIs (Allee effects from too few mature agents in a region) were not documented anywhere I found. The only workarounds seen are panmixia (Ev-OSMOSE), largest-eligible-male selection (inSTREAM), and parthenogenesis (Parry's aphids).

---

## 5. Typical school/group sizes in nature for the Hot Brook species (for an "agent = school" mapping)

### Takeaway
Group-size data for these species are mostly qualitative.

| Species | Group behaviour | Source quality |
|---|---|---|
| Yellow perch | Schools of 50–200+ fish of one size and age | Agency pages |
| Golden shiner | Schools in the littoral by day, disperses at night; "small schools" | Agency / species accounts |
| White perch | "Large schools", deeper water by day, inshore at night | Agency pages |
| Pumpkinseed | Adults in pairs or loose groups of 3–4; young in fairly large schools | FishBase |
| Brown bullhead | Fry move as a tight parent-guarded "ball" | Agency pages |
| Chain pickerel | Solitary ambusher | Agency pages |
| Young smallmouth bass | Disperse from the nest rather than school | Old field note |
| Banded killifish | Group size flexible: smaller when feeding, larger under alarm | Experiment |

Across pelagic fishes, school-size distributions follow a universal truncated power law: W(N) ∝ N⁻¹ up to a cut-off set by population density / break-up rate. This gives a principled way to distribute worth across school agents.

### Cited Findings

**Yellow perch**
- "Gregarious and active during the day", forming spindle-shaped groups of 50 to 200 or more fish, generally of the same size and age. Some loners swim alone — [Wisconsin DNR yellow perch species page](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Species_yellowperch.pdf)
- Schools of 50–200 individuals of one size and year-class. They stay in deeper, darker areas by day and move into the shallows to feed toward evening — [NC fish account (yellow perch)](https://hrla.com/resources/site/ncfish/yellow_perch.htm)

**Golden shiner**
- Schools in the littoral zone during the day, breaking up and moving to open water shortly after sunset (citing Hall et al. 1979, J. Fish. Res. Board Can.) — [Fishes of Texas (golden shiner)](https://fishesoftexas.org/taxa/notemigonus-crysoleucas)
- Swims in small schools in midwater or near the surface; prefers vegetated areas — [Illinois DNR golden shiner sheet](https://dnr.illinois.gov/content/dam/soi/en/web/dnr/education/cdindex/goldenshinerapdf.pdf)
- Larvae 10–30 mm form schools in vegetated littoral areas; 5–10 mm larvae stay near the surface at the littoral edge (Faber 1980, Lac Heney) — [Animal Diversity Web](https://animaldiversity.org/accounts/Notemigonus_crysoleucas/)

**Mixed shoals in a lake**
- In a New Brunswick lake (banded killifish, golden shiner, white sucker), ten entire shoals collected were assorted by species and body length.
- Shoals encountered other shoals about every 1.1 min, each encounter lasting 3.7 s on average.
- Shoal size affected encounter duration. Whether fish switched shoals depended on length and species differences, not shoal size.

  — [Krause et al. 2000, Proc. R. Soc. B 267:2011–2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC1690773)

**Banded killifish**
- Groups were smaller with food odour, larger with alarm cues, and intermediate with both. A simple IBM that varies neighbour-interaction distance reproduces the group-size distributions — [Hoare, Couzin, Godin & Krause 2004, Anim. Behav.](https://kops.uni-konstanz.de/handle/123456789/39962)

**Pumpkinseed**
- Adults seldom school; they usually occur in pairs or loose groups of three to four. Young aggregate in fairly large schools — [FishBase: Lepomis gibbosus](https://fishbase.se/summary/3372)

**White perch**
- Exhibits schooling behaviour — [Ontario Freshwater Fishes Life History Database](https://ontariofishes.ca/fish_detail.php?FID=138)
- Moves in large schools, generally in deeper water by day and near shore at night — [Nebraska Game & Parks field guide](https://digital.outdoornebraska.gov/i/606672/30)
- Contrary evidence: Virginia telemetry found most tagged fish showed site fidelity, with summer home ranges averaging 0.11 km² — [TAFS T08-176.1 (abstract)](https://www.tandfonline.com/doi/abs/10.1577/T08-176.1)

**Brown bullhead**
- Larvae are "shepherded about in a tight school or 'ball'" by the parents; strays are carried back in the mouth — [OARS species account (brown bullhead)](https://oars3rivers.org/river/wildlife/fish/description/brownbullhead)
- Parents accompany young until about 2 inches long — [Michigan DNR bullheads](https://www.michigan.gov/dnr/education/michigan-species/fish-species/bullheads)

**Chain pickerel**
- Solitary ambush predator hiding in vegetation — [NC Wildlife: chain pickerel](https://ncwildlife.org/species/chain-pickerel)
- "Likely to be found alone rather than in groups" — [Florida Springs Institute field guide](https://floridaspringsinstitute.org/fish/chain-pickerel/)

**Smallmouth bass**
- Young "have much less inclination to school than the largemouth"; dispersed individually within a day to about 30 ft from the nest. This is an older Wisconsin field note; author and date unconfirmed — [UW digital collection note](https://search.library.wisc.edu/digital/AFVCQGA76OK3568P/text/ASQLIQQLTUWA5V8Y)
- Brood dispersion in the nearshore increased through the parental-care period — [Friesen & Ridgway 2000](https://www.harkness.ca/PDFs/Contributions%202000s/Friesen%20Ridgway%202000.pdf)

**Group-size distributions**
- Pelagic fish school sizes follow W(N) ∝ N^(−1) (exponent ≈ −1, "biologically universal"), truncated at a cut-off equal to ⟨N⟩_P, the expected size of the school a random individual is in.
- ⟨N⟩_P is linear in fish population density divided by the school break-up rate.
- The law is independent of the space dimension. Empirical exponents for single data sets range 0.7–1.8 before finite-size scaling.
- The fraction of fish in N-sized schools, P(N) = N·W(N), is thin-tailed.

  — [Niwa 2004, J. Theor. Biol. (arXiv q-bio/0402003)](https://arxiv.org/abs/q-bio/0402003)
- Fission–fusion mechanism: schools merge on meeting, and split at a size-independent rate with uniform split sizes — [Niwa 2004](https://arxiv.org/pdf/q-bio/0402003)

### Inferences
- **A natural three-tier mapping** (a judgement call; agent counts are illustrative):
  - **Schooling species → one agent = one school.** Yellow perch, golden shiner, white perch, juvenile sunfish, banded killifish, and probably fallfish and dace in the brook. Draw worth n from Niwa's form: frequency ∝ N⁻¹·exp(−N/⟨N⟩_P), with ⟨N⟩_P ~ 100–300 for perch and shiner and larger for white perch (an assumption). Perch schools sorted by size and age (Wisconsin DNR) and Krause's assortment by species and length both justify one length per SI.
  - **Loose-group species → one agent = a local "group" of ~3–20 fish.** Adult pumpkinseed (3–4), white sucker and brown bullhead adults.
  - **Solitary predators → agent ≈ one fish where affordable.** Chain pickerel and adult smallmouth.

  Budget check: ~600 piscivore agents at n ≈ 5–15 covers ~3,000–9,000 adult predators (≈ 5–15 per ha). The remaining ~1,500–2,400 agents represent ~1.5 M forage and other fish, so n ≈ 600–1,000 per school agent. That is above the natural perch school size. Either n is allowed to exceed the natural school size (one agent = several co-moving schools), or small-bodied forage fish (killifish, dace, small shiners) are carried as brainless SI cohorts like the existing fry schools.
- **Merge and split rates can be biological.** Niwa's fission–fusion picture (merge on encounter, split at a size-independent rate) gives a principled schedule for merging and splitting school agents. The cut-off ⟨N⟩_P then grows naturally with density, i.e. bigger schools in productive, crowded basins. The same Teunissen genome rules apply (Q1/Q4).
- **Diel behaviour is sourced and matters for anglers.** Shiners (littoral by day, dispersing at night) and white perch (deep by day, inshore at night) mean school agents should be allowed to "loosen" at night: a larger spread radius and lower encounter accessibility. This should not be a literal split, to avoid diurnal merge/split churn.

### Gaps
- No quantitative field school-size data were found for golden shiner, white perch, white sucker, brown bullhead (adults), fallfish, blacknose dace or redbreast sunfish. The perch numbers come from agency pages, not a measured distribution.
- The Hall et al. 1979 and Faber 1980 shiner papers and Krause et al. 2000's shoal counts were not read in full.
- Niwa's law was fitted to pelagic marine schools (purse-seine and acoustic data). Its applicability to small littoral freshwater shoals is untested.
- Fallfish and blacknose dace group behaviour: no reliable source found.
