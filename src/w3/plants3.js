// plants3.js — the 3-D lakes' aquatic plants (pure: no DOM; Node and browser). Stage 7a: the weeds as a field on the bed —
// per bed cell and growth form, the living shoots and the storage they overwinter in (rhizomes, tubers, turions; g dry mass
// per m² of that cell's bed), growing with the light at their canopy, the temperature and the nutrients, dying back in autumn,
// with their N and P inside the lakes' closed budgets. What the others read: the zooplankton's refuge in the weed volume
// (chem3 plantRef), the stems that hide small fish (stems per m² per column), the O₂ the beds make by day and use at night,
// the shade floating leaves cast on the bed.
// Research: docs/research_notes/Whole lake 3D fish simulation/macrophytes.md (§8 the parameters per growth form; §7 the
// suggested mechanisms; sources and their weaknesses there).
import { clamp } from '../core.js';
import { GEO, LAND, BROOK } from './geometry.js';
import { ENV, ICE, SEASON, PLANKTON } from '../config.js';
import { TS, DAY3, CLOCK3 } from './clock3.js';

// THE PLANTS OF THE LAKES, AS SPECIES (stage 7f, 2026-10-16; the human: plants "provide places for the fish to be, food and
// things for the water, places for insects and other things to be on top of"; research: docs/research_notes/Hot Brook
// populations and water/plant_species_hot_brook.md and Whole lake 3D fish simulation/plant_species_traits.md §6). Only two
// plants are on record in these waters (Nitella flexilis and N. tenuissima, Upper, 2015); the rest is the near-certain flora of
// a soft, coloured eastern Maine lake (nearby lakes, the aerial photos' fringe of lilies and emergents in the coves, Hellquist's
// soft-water group — no hard-water pondweeds). A species the human or a record rules out comes out, as with the fish.
// Each species keeps its GROWTH FORM (EM emergent, FL floating-leaved, SC submerged canopy, IS isoetid rosette, DM deep low
// meadow) for the shared physiology: depth: the bed depths it roots in (m); lightLim: the share of the surface's (season-mean)
// light at its canopy top where its growth just meets its respiration — its DEPTH LIMIT emerges there (floating-leaved and
// emergent forms are set by their depth window instead: their leaves are in full light); Bmax its stand's peak shoot mass
// (g DW/m²); mu its maximum net growth at 20 °C (/day); tStart the water temperature its shoots grow from (°C); carry the share of
// the summer's mass that overwinters (storage, or evergreen shoots); N / P its tissue content (% of dry mass); root the share of
// its P taken from the bed (Carignan 1982); hFull its canopy's height at full biomass (m); stem g DW per shoot; refuge/cover how
// much its weed volume shelters zooplankton and its stems hide fish; core (FL, EM): the depths it grows best in; KL its light
// half-saturation; shelter: the FL and EM species need shelter from the waves (land in at least this many of 8 directions within
// SHELTER_R — set so the lilies and emergents hold the aerial photos' fringe: ~0.6 % of Upper and ~0.3 % of Lower in the
// sheltered coves, 15–45 m from shore at 0.3–1 m; bulrush stands a little more exposed). Per species too: sub — the bed it roots in ('mineral' sand and gravel: the wave-washed
// shallows and the brook; 'organic' mud: coves and the deeper bed; 'any'); noBrook — not in the brook's running water (lilies,
// watershield: "never in swift water"); brookOnly — the brook's stones; invert — its invertebrates per g against a broad pondweed
// (littoral3: finely divided leaves and dense carpets hold the most, rosettes and lilies less); snail — × its form's snails; look —
// the view's (colour; pad radius in m; blade width and count). Values are the research table's; most per-species numbers there
// are scaled from the form ranges (marked there)
export const FORMS3 = [
  // EMERGENT: pickerelweed in sheltered organic shallows (its stems carry the dragonflies' emergence, Bellura borers, Donacia);
  // bulrush on sand to mud, wave-tolerant, buffering the waves — its dead stems the perch's and pickerel's spawning stems
  { key: 'pickerelweed', name: 'Pickerelweed', form: 'EM', sub: 'organic', noBrook: true, depth: [0, 0.9], window: true, core: [0, 0.45], shelter: 6, Bmax: 500, mu: 0.03, tStart: 10, carry: 0.5, standDead: 0.15,
    N: 2.1, P: 0.14, root: 1.0, hFull: 99, stem: 5, refuge: 0.3, cover: 0.6, invert: 0.25, look: { col: 0x5f8a34, w: 0.07, n: 5 } },
  { key: 'bulrush', name: 'Bulrush', form: 'EM', sub: 'any', depth: [0, 1.2], window: true, core: [0.3, 0.9], shelter: 5, Bmax: 400, mu: 0.03, tStart: 9, carry: 0.5, standDead: 0.7,
    N: 2.0, P: 0.13, root: 1.0, hFull: 99, stem: 3, refuge: 0.3, cover: 0.5, invert: 0.4, look: { col: 0x6f8a3a, w: 0.012, n: 9 } },
  // FLOATING-LEAVED, in the coves' mud, sorting by depth (their cores: fragrant water-lily — round notched pads, the commonest of
  // Maine's lilies, from ~12 °C — the shallowest; watershield — small oval pads, ramets living one season, the clone carried by
  // its winter buds, Adams 1969 — between; yellow pond-lily — the larger pads, earlier — the deepest; sharing a form's room, one
  // would otherwise take every cove)
  { key: 'yellowlily', name: 'Yellow pond-lily', form: 'FL', sub: 'organic', noBrook: true, depth: [0.4, 2.1], window: true, core: [0.9, 1.8], shelter: 6, Bmax: 110, mu: 0.035, tStart: 8, carry: 0.75, padGraze: 0.05,
    N: 2.7, P: 0.20, root: 0.85, hFull: 99, stem: 2, refuge: 0.3, cover: 0.8, invert: 0.35, look: { col: 0x4a7a2e, r: [0.07, 0.2] } },
  { key: 'whitelily', name: 'Fragrant water-lily', form: 'FL', sub: 'organic', noBrook: true, depth: [0.3, 2.5], window: true, core: [0.3, 1.0], shelter: 6, Bmax: 100, mu: 0.035, tStart: 12, carry: 0.75, padGraze: 0.05,
    N: 2.7, P: 0.20, root: 0.85, hFull: 99, stem: 2, refuge: 0.3, cover: 0.8, invert: 0.3, look: { col: 0x3f7434, r: [0.05, 0.15] } },
  { key: 'watershield', name: 'Watershield', form: 'FL', sub: 'organic', noBrook: true, depth: [0.5, 2.1], window: true, core: [0.6, 1.6], shelter: 6, Bmax: 80, mu: 0.04, tStart: 6, carry: 0.35, padGraze: 0.05,
    N: 2.7, P: 0.20, root: 0.85, hFull: 99, stem: 1.5, refuge: 0.3, cover: 0.7, invert: 0.35, look: { col: 0x56702c, r: [0.025, 0.065] } },
  // SUBMERGED: ribbon-leaf pondweed (the commonest of a soft Maine lake — 81 % of Highland Lake's sites), large-leaf pondweed (the
  // tall "bass weed", ice-out growth), Robbins' pondweed (a low fern-like carpet deeper than the others, green under the ice),
  // bladderworts (rootless, finely divided, carnivorous; under the lilies)
  { key: 'ribbonleaf', name: 'Ribbon-leaf pondweed', form: 'SC', sub: 'any', depth: [0.3, 3], lightLim: 0.20, KL: 0.15, Bmax: 80, mu: 0.06, tStart: 8, carry: 0.3,
    N: 2.0, P: 0.15, root: 0.8, hFull: 2.0, stem: 0.5, refuge: 0.8, cover: 0.7, invert: 0.6, look: { col: 0x5b6f2a, w: 0.012, n: 6 } },
  { key: 'largeleaf', name: 'Large-leaf pondweed', form: 'SC', sub: 'organic', noBrook: true, depth: [0.8, 4], lightLim: 0.16, KL: 0.15, Bmax: 130, mu: 0.08, tStart: 5, carry: 0.3,
    N: 2.0, P: 0.15, root: 0.8, hFull: 3.0, stem: 0.8, refuge: 1.0, cover: 1.0, invert: 1.0, look: { col: 0x4f6b2c, w: 0.09, n: 4 } },
  { key: 'robbins', name: "Robbins' pondweed", form: 'SC', sub: 'organic', noBrook: true, depth: [1.2, 5], lightLim: 0.11, KL: 0.10, Bmax: 80, mu: 0.04, tStart: 3, carry: 0.7,
    N: 2.0, P: 0.15, root: 0.8, hFull: 0.4, stem: 0.2, refuge: 0.6, cover: 0.6, invert: 0.8, snail: 1.5, look: { col: 0x3d5a26, w: 0.05, n: 7 } },
  { key: 'bladderwort', name: 'Bladderworts', form: 'SC', sub: 'any', noBrook: true, depth: [0.3, 2.5], lightLim: 0.15, KL: 0.15, Bmax: 50, mu: 0.08, tStart: 10, carry: 0.15,
    N: 2.0, P: 0.15, root: 0.3, prey: 10, hFull: 1.0, stem: 0.1, refuge: 1.0, cover: 0.5, invert: 1.3, look: { col: 0x6d7a32, w: 0.006, n: 10 } },   // (rootless: the flocculent bed it lies in (root 0.3) and its PREY (PL3.PREY_*) feed it N and P — on the water's alone it died out)
  // ROSETTES on the wave-washed sand and gravel: pipewort and water lobelia (lobelia takes its CO₂ from the sediment and sends
  // > 97 % of its O₂ into it; lost on organic mud)
  { key: 'pipewort', name: 'Pipewort', form: 'IS', sub: 'mineral', noBrook: true, depth: [0.1, 1.5], lightLim: 0.37, KL: 0.15, Bmax: 80, mu: 0.008, tStart: 3, carry: 0.9, rootO2: 0.6,
    N: 1.5, P: 0.10, root: 0.87, hFull: 0.1, stem: 0.3, refuge: 0.1, cover: 0.2, invert: 0.5, look: { col: 0x5f7a44 } },
  { key: 'lobelia', name: 'Water lobelia', form: 'IS', sub: 'mineral', noBrook: true, depth: [0.3, 1.2], lightLim: 0.43, KL: 0.15, Bmax: 90, mu: 0.005, tStart: 3, carry: 0.95, rootO2: 0.95,
    N: 1.5, P: 0.10, root: 0.87, hFull: 0.08, stem: 0.3, refuge: 0.1, cover: 0.2, invert: 0.5, look: { col: 0x4f7040 } },
  // LOW MEADOW: the stoneworts (Nitella — the lakes' only recorded plants) on the deeper mud; water moss (Fontinalis) on the brook's
  // stones
  { key: 'nitella', name: 'Stoneworts (Nitella)', form: 'DM', sub: 'organic', noBrook: true, depth: [1.0, 4.2], lightLim: 0.06, KL: 0.08, Bmax: 30, mu: 0.02, tStart: 3, carry: 0.9,
    N: 2.0, P: 0.15, root: 0.3, hFull: 0.2, stem: 0.2, refuge: 0.15, cover: 0.2, invert: 1.0, look: { col: 0x2c4630 } },
  { key: 'moss', name: 'Water moss (Fontinalis)', form: 'DM', sub: 'mineral', brookOnly: true, depth: [0.05, 1.3], lightLim: 0.05, KL: 0.08, Bmax: 40, mu: 0.02, tStart: 2, carry: 0.9,
    N: 2.0, P: 0.15, root: 0, hFull: 0.15, stem: 0.2, refuge: 0.15, cover: 0.3, invert: 1.0, look: { col: 0x24402a } },
];
export const NF3 = FORMS3.length;
export const PL3 = {
  RESP: 0.022,          // /day at 20 °C: the shoots' maintenance respiration (0.02–0.024; Q10 below)
  Q10: 2.5,             // growth and respiration (2–3)
  SLOW: 3,              // growth runs every SLOW-th water update (with SLOW × dt)
  SPROUT: 0.10,         // /day: storage feeds the new shoots in spring at up to this (CHARISMA ≤ 10 %)
  SEED: 0.5,            // g DW/m² a bare cell in a form's range is colonised to (spores, fragments, seeds: the bed is never sterile)
  YF_STORE: 0.53,       // year-fraction (~Sep 10) from which the shoots reallocate to storage (PCLake: day 259 + 15)
  STORE_RATE: 0.07,     // /day, autumn: shoots → storage (the carry share) and litter (the rest)
  SHADE_FL: 0.9,        // floating leaves at full cover cut the light below them by this
  SELF: 0.01,           // m²/g: a canopy's self-shading (0.006–0.02)
  WAVE_D: 0.15,         // m: the wave mortality's half-saturation depth (CHARISMA) — the shallowest beds are scoured
  WAVE_M: 0.03,         // /day of the shoots at the water's edge
  WAVE_IS: 0.25,        // × for the rosettes: low, tough and deep-rooted, the plants of wave-washed sand (Maine's pipewort–lobelia shores)
  ICE_SCOUR: 0.5,       // m: shoots shallower than this are lost when the ice forms (ice scour)
  // N and P in the sim's units per g DW per % of tissue content (the water's units are abstract: these set the beds' share of
  // the lakes' nutrients — ~10 % of the P at a summer's peak)
  P_UNIT: 0.003, N_UNIT: 0.0028,   // (N:P by mass ~13 in plants vs ~7 in algae — the units carry that ratio)
  DEATH_DISS: 0.25,     // share of a dying shoot's P released dissolved into the water (the rest stays in the bed's store)
  O2_YIELD: 1.07,       // g O₂ per g DW of growth (and of respiration)
  // the effects: the weed volume (PVI) → a zooplankton refuge 0.8 × logistic(PVI: ½ at 20 %); stems → fish cover (a searching
  // predator's capture falls as 1/(1 + (S/S50)³), S50 ~150 stems/m² — Crowder & Cooper 1982; Savino & Stein 1982)
  REF_MAX: 0.8, PVI_HALF: 0.2, PVI_STEEP: 0.05, S50: 150,
  SHELTER_R: 20,        // m (world; ~200 m real): a direction is sheltered if land lies within this
  // THE BED A SPECIES ROOTS IN: sand and gravel on the wave-washed shallows (shallower than MINERAL_Z m where no more than
  // MINERAL_SHELTER of 8 directions are sheltered) and in the brook; organic mud in the coves and deeper (Maine's lake plant
  // communities sort so: pipewort–lobelia on mineral soils under ~1 m, water-lily beds on organic soils at 0.5–1.5 m — MNAP)
  MINERAL_Z: 1.6, MINERAL_SHELTER: 4,
  FORMS: ['EM', 'FL', 'SC', 'IS', 'DM'],
  // LAST YEAR'S STEMS: of an emergent's autumn die-back, the species' standDead share stays STANDING through the winter (bulrush's
  // stiff culms; pickerelweed's soft leaves mostly collapse) — the cover and spawning stems of the spring, before the new shoots
  // (pickerel and perch spawn at ice-out). Their N and P leach out as they die (released then, as now); their body falls into the
  // bed's organic layer at DEAD_FALL a day (× DEAD_ICE where the ice grips them, shallower than ICE_SCOUR; the shallows' waves too)
  DEAD_FALL: 0.005,     // /day: ~37 % of November's stems still stand in late May, ~20 % in August
  DEAD_ICE: 3,          // × under the ice in the scoured shallows
  DEAD_STEM: 1.5,       // g DW a dead stem (a bulrush culm, its reserves withdrawn) — the stems per m² they make
  DEAD_COVER: 0.7,      // their cover per stem against a live stem's
  // THE BLADDERWORTS' PREY (research: bladderwort_isoetid_chemistry.md Q1–Q3): capture first-order in the prey about the canopy
  // (a laboratory stand cleared its prey exponentially) — F.prey L of water a g DW of plant clears a day at 20 °C (Q10 as its
  // growth), × the prey's selectivity: the littoral crustaceans the copepod field stands for (ostracods, chydorids, cyclopoids) 1,
  // Daphnia — which keep out of the weeds — 0.3, rotifers (caught by chance) 0.2. 10 L/g/day: ~20 mg dry/m²/day (~5,000 animals)
  // from a 40 g/m² stand in 50 µg/L of prey, inside the field range (Austria ~0.07 animals a trap a day × 1,400–17,000 traps per
  // g; ~40–90,000 animals/m²/day over the range — at 20 the sim's richer littoral water, its June peak 150–350 µg/L, gave the
  // range's top and the traps took 5–8 % of the lakes' zooplankton production). Their N and P (crustaceans ~9 % N, ~1.2 % P of dry mass; 80 % of the N and 90 % of the P absorbed — Friday & Quarmby
  // 1994, Adamec 2002) feed the plant: up to 75 % of a season's N in Wisconsin, 40–100 % in Australian isotope work. The sim's
  // zooplankton carry no N or P (their food's comes straight back to the water), so the prey's are drawn from the water about the
  // canopy, where they would be — held as the plant's credit (counted in its budget) until it grows on them
  PREY_SEL: [0.3, 1, 0.2],   // Daphnia, copepods (the littoral crustaceans), rotifers
  PREY_N: 9, PREY_P: 1.2, PREY_EFF_N: 0.8, PREY_EFF_P: 0.9, PREY_T: 8,   // (% of dry mass; absorbed; traps idle below PREY_T °C)
  PREY_DAYS: 3,              // the credit a stand holds: at most this many days of its full growth's needs (the rest of the catch is
                             //   only digested; its N and P stay in the water)
  // THE ROSETTES' ROOTS (Q4–Q5): lobelia sends > 97 % of its O₂ through its roots into the sand (F.rootO2 the share; pipewort is
  // unmeasured — 0.6, between Littorella's leakier leaves and lobelia's), a lawn's ~0.7–2 g O₂/m²/day: it pays the bed's O₂
  // demand first (chem3 rootO2; the rest oxidises the sand's iron and methane — none reaches the water). The oxidised sand (4.3 cm
  // under lobelia, 1.6–2.2 under pondweeds) holds its P on iron: a full lawn cuts the bed's P release to 1 − ISO_RET (chem3
  // lawn; Kvie: far below diffusion; Littorella columns kept 2–5× more P, Fe and Mn)
  ISO_RET: 0.8,
  // THE PADS' GRAZERS (lily_pad_fauna.md): water-lily leaf beetles, Donacia, leaf-case and petiole-boring caterpillars, midge
  // miners eat F.padGraze of the floating leaves' production (Finland: 3–6 % of Nuphar's; grazing raised leaf production, so no
  // more); what they eat goes to the bed as frass and their N and P to the water; their bodies — falling larvae, drowned adults,
  // caterpillars swimming ashore — feed the surface's fish (littoral3 LIT3.PAD_YIELD)
  // SPAWNING STRUCTURE (research: spawning_on_plants.md; fish3 S3 spawn.sub reads it): per bed cell three indices 0–1 of what a
  // spawner can lay on — 1 − e^(−S/SPAWN_HALF) of the structure S (stems per m² × the species' cover, each weighted for the use):
  //  rigid — yellow perch drape their ribbons on RIGID, ERECT structure: last year's standing stems, brush and fallen wood,
  //    stoneworts (Baltic perch: Chara and reeds explained 43–73 % of the strands, total plant cover < 1 %); live soft plants
  //    only when that is scarce (Čech 2012: 6–29 % of strands while dead reed beds stood, 77 % once they were gone);
  //  mat — chain pickerel scatter their eggs just after ice-out over DENSE, SHORT mats (northern pike, the surrogate: most eggs in
  //    dead sedge and short plant mats, fewer among bulrush stems and lily debris — Priegel & Krohn 1975), their larvae hanging
  //    on the plants ~10 days: the rosettes' turf, bladderwort, moss, Robbins' carpets, flattened dead stems;
  //  plant — banded killifish fix their eggs by threads to LIVE submerged plants in midsummer (Potamogeton most; their
  //    Newfoundland lakes' plants are this sim's: lobelia, pipewort, bladderwort, ribbon-leaf pondweed — COSEWIC 2014).
  // `dead` weights last year's standing stems, `wood` the shore's fallen trees and brush (WOOD: by the forested bank along the
  // column, within WOOD_Z m of water — Maine's forest lakes carry ~100–500 logs a km of shore; Little Rock Lake's perch fell from
  // 141/ha to ~5 after its wood was cut from 475 to 128 logs/km, Sass 2006 — predation confounded), `other` any other species
  SPAWN: {
    rigid: { dead: 1, wood: 1, other: 0.15, sp: { pickerelweed: 1, bulrush: 1, nitella: 1, moss: 1, largeleaf: 0.5, robbins: 0.3 } },
    mat: { dead: 0.6, wood: 0.2, other: 0.3, sp: { pipewort: 1, lobelia: 1, bladderwort: 1, moss: 1, robbins: 1, nitella: 0.5, pickerelweed: 0.5, bulrush: 0.5 } },
    plant: { dead: 0.1, wood: 0, other: 0.2, sp: { ribbonleaf: 1, largeleaf: 1, robbins: 1, bladderwort: 1, pipewort: 1, lobelia: 1, nitella: 0.5 } },
  },
  SPAWN_HALF: 30,       // structure (stems/m² × cover) at which an index reaches 1 − 1/e: a moderate stand
  WOOD: 60,             // the structure a wooded shore's band of fallen trees and brush gives (as stems/m² × cover)
  WOOD_W: 1.5,          // m (world): the band's width from the bank (~15 m real across the 1/10 lakes)
  WOOD_Z: 2.5,          // m: wood lies in water shallower than this (a column's deepest)
};

const MIX = 1e-9;
export class Plants3 {
  constructor(env) {
    this.env = env; const ch = this.chem = env.chem, G = this.G = env.G;
    const cells = this.cells = ch.bedCells, nb = cells.length;
    this.Bs = Array.from({ length: NF3 }, () => new Float32Array(nb));   // shoots, g DW/m²
    this.Br = Array.from({ length: NF3 }, () => new Float32Array(nb));   // storage, g DW/m²
    this.gnet = Array.from({ length: NF3 }, () => new Float32Array(nb)); // the last net growth, g DW/m²/day (the O₂ it makes)
    this.dead = new Float32Array(nb);                                    // last year's emergent stems still standing, g DW/m² (PL3.DEAD_FALL)
    this.preyP = new Float64Array(nb); this.preyN = new Float64Array(nb); // the bladderworts' credit from their prey (the sim's N and P units, the cell's)
    this.caught = 0; this.padEaten = new Float32Array(G.NC); this.padAte = 0;   // (g wet of zooplankton the traps took; g DW of pads the grazers ate, per column for littoral3)
    if (!ch.rootO2) ch.rootO2 = new Float32Array(G.NCELL); if (!ch.lawn) ch.lawn = new Float32Array(G.NCELL);   // (the rosettes' root O₂ for the bed's demand; their lawn's cover)
    // each bed cell: its column, its bed depth (the cell's mid-depth — the layer its bed lies in), its water cells above
    this.col = new Int32Array(nb); this.zb = new Float32Array(nb);
    for (let i = 0; i < nb; i++) { const j = cells[i]; this.col[i] = G.colOfCell[j]; this.zb[i] = Math.max(0.05, G.zMid[j]); }
    // each bed cell's water (the brook's running water or a lake's) and its bed (PL3.MINERAL_Z: sand and gravel, or mud)
    this.brook = new Uint8Array(nb); this.mineral = new Uint8Array(nb);
    for (let i = 0; i < nb; i++) { const c = this.col[i]; this.brook[i] = G.body[c] === BROOK ? 1 : 0; this.mineral[i] = this.brook[i] || (this.zb[i] < PL3.MINERAL_Z && env.shelter[c] <= PL3.MINERAL_SHELTER) ? 1 : 0; }
    // each species' form (index into PL3.FORMS), for the stand's shared space: a form's species share its room in a cell
    this.formOf = FORMS3.map(F => PL3.FORMS.indexOf(F.form)); this._occ = new Float32Array(PL3.FORMS.length);
    // each column's SHELTER from the waves: how many of 8 directions meet land within SHELTER_R (env3 computes it: ice uses it too)
    this.shelter = env.shelter;
    // per column: the stems (per m², for the fish), the floating-leaf cover, the weed volume's refuge; per water cell: the
    // refuge (chem3.plantRef, read by the zooplankton feeding)
    this.stems = new Float32Array(G.NC); this.flCover = new Float32Array(G.NC); this.pvi = new Float32Array(G.NC);
    // the spawning structure per column (PL3.SPAWN): the indices, the species' weights per use, the shore's wood
    // (per BED CELL, not per column: a 10-m column on a slope holds its shallow structure and its bare deeper bed — averaged, a
    // perch at 1 m read the deep half's bareness; idxOf maps a chem cell to its bed-cell index here)
    this.idxOf = new Int32Array(G.NCELL).fill(-1); for (let i = 0; i < nb; i++) this.idxOf[cells[i]] = i;
    this.spawnS = {}; this._spW = {}; for (const u of Object.keys(PL3.SPAWN)) { this.spawnS[u] = new Float32Array(nb); this._spW[u] = FORMS3.map(F => PL3.SPAWN[u].sp[F.key] ?? PL3.SPAWN[u].other); }
    this.wood = new Float32Array(G.NC); this._spN = 0;
    // (per species, for the per-step O₂ loop: start temperatures, evergreen, the roots' O₂ share, window, canopy height, peak)
    this._tS = Float32Array.from(FORMS3, F => F.tStart); this._ev = Uint8Array.from(FORMS3, F => F.carry > 0.8 ? 1 : 0); this._rO = Float32Array.from(FORMS3, F => F.rootO2 || 0);
    this._isF = FORMS3.map((F, f) => F.rootO2 ? f : -1).filter(f => f >= 0);   // (the rosettes: their lawn)
    this._win = Uint8Array.from(FORMS3, F => F.window ? 1 : 0); this._hF = Float32Array.from(FORMS3, F => F.hFull); this._bM = Float32Array.from(FORMS3, F => F.Bmax);
    { const FOREST = { evergreen: 1, mixed: 1, deciduous: 1, woody_wet: 1, shrub_wet: 0.5, shrub: 0.3 }, bank = new Float32Array(G.NC), NX = GEO.NX, NY = GEO.NY;
      for (let i = 0; i < GEO.N; i++) {
        if (GEO.body[i] === LAND || GEO.body[i] === BROOK) continue;
        const r = Math.floor(i / NX), q = i % NX; let w = 0;
        for (const [dq, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const qq = q + dq, rr = r + dr; if (qq < 0 || rr < 0 || qq >= NX || rr >= NY) continue; const k = rr * NX + qq; if (GEO.body[k] === LAND) w += FOREST[GEO.CLASSES[GEO.cover[k]]] ?? 0; }
        if (!w) continue; const [x, y] = GEO.cellCentre(i), c = env.colAt(x, y); if (c >= 0) bank[c] += w * GEO.CELL * 0.8;
      }
      for (let c = 0; c < G.NC; c++) if (bank[c] > 0) this.wood[c] = PL3.WOOD * clamp(bank[c] * PL3.WOOD_W / G.area[c], 0, 1);   // (on the column's bed cells shallower than WOOD_Z)
    }
    this.ref = new Float32Array(G.NC); this._colA = new Float32Array(G.NC); this._canopy = new Float32Array(G.NC);   // (_canopy: the weeds' height per column, m)
    if (!ch.plantRef) ch.plantRef = new Float32Array(G.NCELL);
    this._n = 0; this.prod = 0; this.litter = 0;
    this.seed();
  }
  // a lake's plants at its start: each form in its range, at the share of its stand the season allows (from storage)
  seed() {
    const yf = this.env.yearFrac(), T = this.env.temp;
    for (let f = 0; f < NF3; f++) {
      const F = FORMS3[f];
      for (let i = 0; i < this.cells.length; i++) {
        if (!this._inRange(F, i)) continue;
        const grow = yf > 0.15 && yf < 0.6 && T[this.cells[i]] > F.tStart;   // (growing season: part of its stand up)
        this.Br[f][i] = F.Bmax * 0.15; this.Bs[f][i] = F.carry > 0.8 ? F.Bmax * 0.3 : grow ? F.Bmax * 0.15 : F.Bmax * 0.02;   // (the evergreens — rosettes, Nitella, moss — stand all year at about what they hold (0.2–0.3 of a stand by their second summer); slow growers, ~0.4/yr at best, they would take years to fill in from a sprouting stand)
      }
    }
    this._outputs(true);
  }
  // the date JUMPED (the view's season buttons): each stand takes the new season's shape at once, conserving its mass, N and P —
  // into dormancy the shoots go to storage at the form's carry share and the rest dies (its N and P to the water and the bed);
  // into the growing season the storage sprouts (the evergreen rosettes and mosses keep their shoots either way)
  jump() {
    const e = this.env, ch = this.chem, G = this.G, yf = e.yearFrac(), T = e.temp, dormantYr = yf >= PL3.YF_STORE || yf < 0.1;
    if (!dormantYr) {   // (the stems that stood last winter have been falling since November: ~0.67 of the year from March 1)
      const k = 1 - Math.exp(-PL3.DEAD_FALL * (((yf - 0.67) % 1 + 1) % 1) * 365);
      for (let i = 0; i < this.cells.length; i++) { const d = this.dead[i] * k; if (!(d > 0)) continue; const j = this.cells[i]; this.dead[i] -= d; ch.sedOM[j] += d * G.bedA[j] / ch.a[j]; }
    }
    for (let f = 0; f < NF3; f++) {
      const F = FORMS3[f], Bs = this.Bs[f], Br = this.Br[f]; if (F.carry > 0.8) continue;
      for (let i = 0; i < this.cells.length; i++) {
        const j = this.cells[i];
        if (dormantYr || T[j] <= F.tStart) {
          const b = Bs[i]; if (!(b > 0)) continue;
          const sd = dormantYr && F.standDead ? b * (1 - F.carry) * F.standDead : 0;
          Br[i] += b * F.carry; this.litter += this._die(f, i, b * (1 - F.carry) - sd, j, G.bedA[j], ch.a[j], ch.w[j]); Bs[i] = 0;
          if (sd > 0) { this.litter += this._die(f, i, sd, j, G.bedA[j], ch.a[j], ch.w[j], true); this.dead[i] += sd; }
        } else { const m = Br[i] * 0.85; Br[i] -= m; Bs[i] += m; }
        this.gnet[f][i] = 0;
      }
    }
    this._outputs(true);
  }
  _inRange(F, i) {
    const z = this.zb[i]; if (z < F.depth[0] || z > F.depth[1]) return false;
    const br = this.brook[i]; if ((F.noBrook && br) || (F.brookOnly && !br)) return false;
    return F.sub === 'any' || (F.sub === 'mineral') === !!this.mineral[i];
  }
  // N and P held by the plants (the sim's units) — counted in chem3's inventories
  inventoryP() { let s = 0; for (let f = 0; f < NF3; f++) { const u = FORMS3[f].P * PL3.P_UNIT, Bs = this.Bs[f], Br = this.Br[f]; for (let i = 0; i < this.cells.length; i++) s += (Bs[i] + Br[i]) * u * this.G.bedA[this.cells[i]]; } for (let i = 0; i < this.cells.length; i++) s += this.preyP[i]; return s; }
  inventoryN() { let s = 0; for (let f = 0; f < NF3; f++) { const u = FORMS3[f].N * PL3.N_UNIT, Bs = this.Bs[f], Br = this.Br[f]; for (let i = 0; i < this.cells.length; i++) s += (Bs[i] + Br[i]) * u * this.G.bedA[this.cells[i]]; } for (let i = 0; i < this.cells.length; i++) s += this.preyN[i]; return s; }
  total(f) { let s = 0; const B = this.Bs[f]; for (let i = 0; i < this.cells.length; i++) s += B[i] * this.G.bedA[this.cells[i]]; return s; }   // g DW of shoots

  // ============================================================ step ===================================================
  step(dt) {
    if (++this._n >= PL3.SLOW) { this._grow(dt * this._n); this._n = 0; this._outputs(); }
    this._o2(dt);
  }
  // GROWTH, PHENOLOGY, DEATH over ds (s): per cell and form
  _grow(ds) {
    const e = this.env, ch = this.chem, G = this.G, T = e.temp, yf = e.yearFrac(), dd = ds / DAY3, kd = ch.attenuation();
    const store = yf >= PL3.YF_STORE && yf < 0.9, spring = yf > 0.1 && yf < PL3.YF_STORE;
    const seasonL = e.lightDay;   // (the season's noon height: the light's share of the summer's)
    let prod = 0, lit = 0;
    for (let i = 0; i < this.cells.length; i++) {
      const j = this.cells[i], c = this.col[i], A = G.bedA[j], a = ch.a[j], w = ch.w[j], z = this.zb[i], Tj = T[j];
      const qT = Math.pow(PL3.Q10, (Tj - 20) / 10), iceCut = 1 - ICE.LIGHT_CUT * e.ice[c];
      if (this.dead[i] > 0) {   // last year's stems fall into the bed's organic layer (faster in the ice's and the waves' reach)
        const kF = PL3.DEAD_FALL * (e.ice[c] > 0.5 && z < PL3.ICE_SCOUR && !this.brook[i] ? PL3.DEAD_ICE : 1) + (z < 0.6 && !this.brook[i] ? PL3.WAVE_M * PL3.WAVE_D / (z + PL3.WAVE_D) : 0);
        const d = this.dead[i] * Math.min(1, kF * dd); this.dead[i] -= d; ch.sedOM[j] += d * A / a;   // (kF·dd ≪ 1 a growth step)
      }
      // the light at the bed: the surface's day-mean × the ice × the water × the floating leaves' shade
      const flShade = 1 - PL3.SHADE_FL * this.flCover[c], occ = this._occ; occ.fill(0);
      for (let f = 0; f < NF3; f++) occ[this.formOf[f]] += this.Bs[f][i] / FORMS3[f].Bmax;   // (a form's species share its room)
      for (let f = 0; f < NF3; f++) {
        const F = FORMS3[f], Bs = this.Bs[f], Br = this.Br[f];
        if (!this._inRange(F, i)) { if (Bs[i] + Br[i] > 0) { lit += this._die(f, i, Bs[i] + Br[i], j, A, a, w); Bs[i] = 0; Br[i] = 0; } this.gnet[f][i] = 0; continue; }
        let b = Bs[i];
        // COLONISATION: a bare cell in the form's range gets a propagule (spores, fragments, seeds) — paid for in nutrients
        if (b < PL3.SEED && Br[i] < PL3.SEED && Tj > F.tStart && !store) b += this._take(F, PL3.SEED - b, j, A, a, w);
        // SPRING: storage feeds the shoots from the form's start temperature
        if (spring && Tj > F.tStart && Br[i] > 0) { const s = Math.min(Br[i], Br[i] * PL3.SPROUT * dd); Br[i] -= s; b += s; }
        // GROWTH: light at the canopy top (submerged forms; floating-leaved and emergent leaves are in full light, their growth
        // set by their depth window), the temperature, the nutrients (P from the bed and the water; N from the water). LOSSES:
        // the form's own — respiration and, past it, what the field's light limits imply: epiphyte shading, sloughing, grazing,
        // the cost of next year's stores — set so that its growth just pays them at its light limit (lightLim of the day-mean
        // surface light): its DEPTH LIMIT emerges there, while plants near the surface grow light-saturated
        let fL, lossR = PL3.RESP;
        if (F.window) fL = (z <= F.core[1] ? (z >= F.core[0] ? 1 : clamp((z - F.depth[0]) / Math.max(0.05, F.core[0] - F.depth[0]), 0, 1)) : clamp((F.depth[1] - z) / (F.depth[1] - F.core[1]), 0, 1))
          * clamp(this.shelter[c] - F.shelter + 1, 0, 2) / 2;   // (and the waves: half growth at its shelter, full one direction more)
        else {
          const h = Math.min(z, F.hFull * clamp(b / F.Bmax, 0.05, 1)), Itop = iceCut * flShade * Math.exp(-kd * (z - h)) * Math.exp(-PL3.SELF * b * 0.3);   // (share of the surface's)
          fL = Itop * seasonL / (Itop * seasonL + F.KL);
          const phi = F.lightLim / (F.lightLim + F.KL); lossR = Math.max(PL3.RESP, F.mu * phi / (1 - phi));
        }
        const sp = ch.sedP[j], ph = ch.phos[j], nT = ch.nh4[j] + ch.no3[j];
        let fP = (sp * F.root + ph * 4 * (1 - F.root)) / (sp * F.root + ph * 4 * (1 - F.root) + 0.15), fN = nT / (nT + 0.1);
        if (F.prey) {   // the traps: the catch, and its N and P lifting the limits (the credit against a day of full growth's needs)
          if (Tj > PL3.PREY_T && b > 2) this._capture(f, i, b, ds, qT);   // (a stand, not the seed propagules everywhere in its range)
          const day = Math.max(MIX, F.mu * qT * b * A);
          fP = Math.min(1, fP + this.preyP[i] / (day * F.P * PL3.P_UNIT)); fN = Math.min(1, fN + this.preyN[i] / (day * F.N * PL3.N_UNIT));
        }
        const ever = F.carry > 0.8, growing = Tj > F.tStart && (!store || ever);   // (the evergreens — rosettes, Nitella, moss — keep their shoots and grow whenever it is warm and light enough: no autumn reallocation)
        const rate = growing ? (F.mu + lossR) * qT * fL * Math.min(fP, fN) - lossR * qT : -lossR * qT * 0.3;   // (/day; dormant: a third)
        let g = rate > 0 ? rate * Math.max(0, 1 - occ[this.formOf[f]]) * b * dd : 0;   // (space limits the net growth: a good site fills its stand — shared by its form's species)
        if (g > 0) { g = this._take(F, g, j, A, a, w, i); b += g; prod += g * A; }
        this.gnet[f][i] = g / Math.max(MIX, dd);
        if (F.padGraze && g > 0) {   // the pads' grazers eat their share of the production (frass to the bed; bodies to littoral3's surface)
          const eat = Math.min(b, g * F.padGraze); b -= eat; lit += this._die(f, i, eat, j, A, a, w); this.padEaten[c] += eat * A; this.padAte += eat * A;
        }
        let loss = rate < 0 ? -rate * b * dd : 0;
        // and the shallowest beds' wave scour, autumn's reallocation, ice scour
        const br = this.brook[i];   // (the brook: running water, no waves; its moss holds to the stones under the ice)
        if (z < 0.6 && !br) loss += PL3.WAVE_M * PL3.WAVE_D / (z + PL3.WAVE_D) * (F.form === 'IS' ? PL3.WAVE_IS : 1) * b * dd;
        let stand = 0;
        if (store && b > 0 && !ever) {   // shoots → storage (carry) and litter (the rest; an emergent's standDead share of it stays standing)
          const m = Math.min(b, b * PL3.STORE_RATE * dd);
          Br[i] += m * F.carry; loss += m * (1 - F.carry); b -= m * F.carry;
          if (F.standDead) stand = m * (1 - F.carry) * F.standDead;
        }
        if (e.ice[c] > 0.5 && z < PL3.ICE_SCOUR && !br) loss += b * Math.min(1, dd);
        loss = Math.min(loss, b);
        if (loss > 0) {
          const sd = Math.min(stand, loss);   // (the standing dead: their N and P leach now, their body falls later)
          lit += this._die(f, i, loss - sd, j, A, a, w); b -= loss;
          if (sd > 0) { lit += this._die(f, i, sd, j, A, a, w, true); this.dead[i] += sd; }
        }
        Bs[i] = b;
        // storage slowly ages (respiration of the reserves)
        if (Br[i] > 0) { const r = Br[i] * PL3.RESP * 0.1 * qT * dd; Br[i] -= r; lit += this._die(f, i, r, j, A, a, w, true); }
      }
    }
    this.prod += prod; this.litter += lit;
  }
  // build g (g DW/m²) of form F in bed cell j: its N and P (per m² of bed → the cell's units) from the bed's store (the roots'
  // share) and the water (the shoots'), at most half of what each holds a step; returns the g DW actually built
  _take(F, g, j, A, a, w, i = -1) {
    if (F.prey && i >= 0) {   // the bladderworts' prey first (their credit builds its share of g outright), then the bed and the water
      const pN = g * A * F.P * PL3.P_UNIT, nN = g * A * F.N * PL3.N_UNIT;
      const fr = Math.min(pN > 0 ? Math.min(pN, this.preyP[i]) / pN : 1, nN > 0 ? Math.min(nN, this.preyN[i]) / nN : 1);
      this.preyP[i] -= pN * fr; this.preyN[i] -= nN * fr;
      return fr >= 1 ? g : g * fr + this._take(F, g * (1 - fr), j, A, a, w);
    }
    const ch = this.chem, pNeed = g * A * F.P * PL3.P_UNIT, nNeed = g * A * F.N * PL3.N_UNIT;
    const pBed = Math.min(pNeed * F.root, ch.sedP[j] * a * 0.5), pW = Math.min(pNeed - pBed, ch.phos[j] * w * 0.5), Pav = pBed + pW;
    const nAv = (ch.nh4[j] + ch.no3[j]) * w * 0.5;
    const frac = Math.min(1, Pav / Math.max(MIX, pNeed), nAv / Math.max(MIX, nNeed)); if (!(frac > 0)) return 0;
    const pTake = pNeed * frac; if (Pav > 0) { ch.sedP[j] -= pTake * (pBed / Pav) / a; ch.phos[j] -= pTake * (pW / Pav) / w; }
    const nTake = nNeed * frac, fromA = Math.min(nTake, ch.nh4[j] * w); ch.nh4[j] -= fromA / w; ch.no3[j] -= (nTake - fromA) / w;
    return g * frac;
  }
  // THE BLADDERWORTS' CATCH over ds (s) in bed cell i: first-order in the prey of the water their canopy fills (F.prey L/g DW/day
  // × the prey's selectivity × qT); the catch's N and P (PL3.PREY_*) drawn from that water into the plant's credit, up to
  // PL3.PREY_DAYS of its full growth's needs
  _capture(f, i, b, ds, qT) {
    const F = FORMS3[f], ch = this.chem, G = this.G, j = this.cells[i], c = this.col[i], z = this.zb[i], A = G.bedA[j];
    const h = Math.min(z, F.hFull * clamp(b / F.Bmax, 0.05, 1)), j0 = G.cell0[c], kB = j - j0, k0 = Math.min(Math.max(0, Math.floor((z - h) / G.DZ)), kB);
    let V = 0; for (let k = k0; k <= kB; k++) V += G.vol[j0 + k];
    if (!(V > 0)) return;
    const clr = F.prey * qT * b * A * (ds / DAY3) / (V * 1000), S = PL3.PREY_SEL, flds = [ch.zooD, ch.zooC, ch.zooR];   // (volumes the stand clears)
    let wet = 0;
    for (let k = k0; k <= kB; k++) {
      const q = j0 + k;
      for (let t = 0; t < 3; t++) { const fld = flds[t], z0 = fld[q]; if (!(z0 > 0)) continue; const take = z0 * -Math.expm1(-clr * S[t]); fld[q] = z0 - take; wet += take * ch.w[q]; }
    }
    if (!(wet > 0)) return;
    this.caught += wet;
    const dry = wet * PLANKTON.DRY, day = F.mu * qT * b * A * PL3.PREY_DAYS;
    const pWant = Math.min(dry * PL3.PREY_P * PL3.P_UNIT * PL3.PREY_EFF_P, Math.max(0, day * F.P * PL3.P_UNIT - this.preyP[i]));
    const nWant = Math.min(dry * PL3.PREY_N * PL3.N_UNIT * PL3.PREY_EFF_N, Math.max(0, day * F.N * PL3.N_UNIT - this.preyN[i]));
    let pAv = 0, nAv = 0; for (let k = k0; k <= kB; k++) { const q = j0 + k; pAv += ch.phos[q] * ch.w[q]; nAv += (ch.nh4[q] + ch.no3[q]) * ch.w[q]; }
    const fp = pAv > 0 ? Math.min(1, pWant / (0.5 * pAv)) : 0, fn = nAv > 0 ? Math.min(1, nWant / (0.5 * nAv)) : 0;   // (at most half of what the water holds)
    for (let k = k0; k <= kB; k++) {
      const q = j0 + k, wq = ch.w[q];
      if (fp > 0) { const t = ch.phos[q] * 0.5 * fp; ch.phos[q] -= t; this.preyP[i] += t * wq; }
      if (fn > 0) { const tA = ch.nh4[q] * 0.5 * fn, tN = ch.no3[q] * 0.5 * fn; ch.nh4[q] -= tA; ch.no3[q] -= tN; this.preyN[i] += (tA + tN) * wq; }
    }
  }
  // a dying mass m (g DW/m²): its N to ammonium; its P DEATH_DISS to the water, the rest to the bed's store; its body to the
  // bed's organic layer (food for its worms and scuds). Returns the g DW lost.
  _die(f, i, m, j, A, a, w, quiet = false) {
    const F = FORMS3[f], ch = this.chem, p = m * A * F.P * PL3.P_UNIT, n = m * A * F.N * PL3.N_UNIT;
    ch.phos[j] += p * PL3.DEATH_DISS / w; ch.sedP[j] += p * (1 - PL3.DEATH_DISS) / a; ch.nh4[j] += n / w;
    if (!quiet) ch.sedOM[j] += m * A / a;
    return m * A;
  }
  // O₂: the shoots photosynthesise by the hour's light (growth's O₂ spread over the day as the light comes) and respire always,
  // in the water about their canopy (the bed cell's and the ones above it the canopy reaches)
  _o2(dt) {
    const e = this.env, ch = this.chem, G = this.G, T = e.temp, dd = dt / DAY3, yf = e.yearFrac(), store = yf >= PL3.YF_STORE && yf < 0.9;
    const now = e.sun / Math.max(1e-3, e.dayFrac * 2 / Math.PI);   // (the sun's curve over its day's mean: a day's sum is the day's)
    const Bs = this.Bs, gn = this.gnet, tS = this._tS, ev = this._ev, rO = this._rO, win = this._win, hF = this._hF, bM = this._bM, R0 = PL3.RESP;
    for (let i = 0; i < this.cells.length; i++) {
      const j = this.cells[i], A = G.bedA[j], Tj = T[j], qT = Math.pow(PL3.Q10, (Tj - 20) / 10);
      let gross = 0, resp = 0, h = 0, root = 0; const z = this.zb[i];
      for (let f = 0; f < NF3; f++) {
        const b = Bs[f][i]; if (!(b > 0)) continue;
        const rr = R0 * qT * b, r = Tj > tS[f] && (!store || ev[f]) ? rr : rr * 0.3, g = (gn[f][i] + rr) * now;   // (the day's gross production, made as the light comes; a dormant shoot respires at a third, as _grow's dormant loss)
        const ro = rO[f];
        if (ro) { root += (g - r) * ro; resp += r * (1 - ro); gross += g * (1 - ro); }   // (a rosette's roots: into the sand)
        else { resp += r; gross += g; }
        const hh = win[f] ? z : Math.min(z, hF[f] * Math.min(1, Math.max(0.05, b / bM[f]))); if (hh > h) h = hh;
      }
      if (root !== 0) ch.rootO2[j] += root * A * dd * PL3.O2_YIELD / ENV.O2_MGL;   // (normalised O₂ × m³: chem3 _o2Demand spends it on the bed's demand)
      if (!(gross > 0 || resp > 0)) continue;
      const dO = (gross - resp) * A * dd * PL3.O2_YIELD / ENV.O2_MGL;   // normalised O₂ × m³
      // spread over the water the canopy fills: the bed cell and the layers above it up to the canopy's top
      const c = this.col[i], j0 = G.cell0[c], kTop = Math.max(0, Math.floor((z - h) / G.DZ)), kB = j - j0;
      let V = 0; for (let k = Math.min(kTop, kB); k <= kB; k++) V += G.vol[j0 + k];
      for (let k = Math.min(kTop, kB); k <= kB; k++) ch.o2[j0 + k] = Math.max(0, ch.o2[j0 + k] + dO / V);
    }
  }
  // what the others read: per column the stems per m² (fish cover), the floating leaves' cover (shade), the weed volume (PVI)
  // and its zooplankton refuge — the refuge applied to the column's water cells the canopy reaches
  _outputs(full = false) {
    const G = this.G, ch = this.chem, st = this.stems, fl = this.flCover, pv = this.pvi, cA = this._colA, SP = PL3.SPAWN;
    const doSp = full || ++this._spN % 16 === 0, sR = this.spawnS.rigid, sM = this.spawnS.mat, sPl = this.spawnS.plant, Wr = this._spW.rigid, Wm = this._spW.mat, Wp = this._spW.plant;   // (the spawning structure changes slowly: every 16th)
    st.fill(0); fl.fill(0); pv.fill(0); cA.fill(0); this._canopy.fill(0);
    for (let i = 0; i < this.cells.length; i++) {
      const j = this.cells[i], c = this.col[i], A = G.bedA[j], z = this.zb[i]; cA[c] += A;
      if (this.dead[i] > 0) st[c] += this.dead[i] / PL3.DEAD_STEM * A * PL3.DEAD_COVER;   // (last year's standing stems)
      if (doSp) {   // (the spawning structure: each species' stems × its cover × its weight for the use, and the standing dead)
        const d = this.dead[i] / PL3.DEAD_STEM * PL3.DEAD_COVER; let r = d * SP.rigid.dead, m = d * SP.mat.dead, q = d * SP.plant.dead;
        for (let f = 0; f < NF3; f++) { const b = this.Bs[f][i]; if (b > 0) { const v = b / FORMS3[f].stem * FORMS3[f].cover; r += v * Wr[f]; m += v * Wm[f]; q += v * Wp[f]; } }
        const w = z < PL3.WOOD_Z ? this.wood[c] : 0, H = PL3.SPAWN_HALF;   // (each bed cell's own index; the shore's wood on the shallow cells)
        sR[i] = 1 - Math.exp(-(r + w * SP.rigid.wood) / H); sM[i] = 1 - Math.exp(-(m + w * SP.mat.wood) / H); sPl[i] = 1 - Math.exp(-(q + w * SP.plant.wood) / H);
      }
      let lawn = 0; for (const f of this._isF) lawn += Math.min(1, this.Bs[f][i] / this._bM[f]) * this._rO[f] / 0.95;
      ch.lawn[j] = Math.min(1, lawn);   // (the rosettes' oxidised sand: chem3 _sedimentP holds its P)
      for (let f = 0; f < NF3; f++) {
        const b = this.Bs[f][i]; if (!(b > 0)) continue; const F = FORMS3[f], cov = clamp(b / F.Bmax, 0, 1);
        st[c] += b / F.stem * A * F.cover;
        if (F.form === 'FL') fl[c] += cov * A;
        const h = Math.min(z, F.hFull * clamp(b / F.Bmax, 0.05, 1));
        pv[c] += cov * (h / z) * F.refuge * A;
        this._canopy[c] = Math.max(this._canopy[c], F.window ? z : h);
      }
    }
    for (let c = 0; c < G.NC; c++) {
      if (cA[c] > 0) { st[c] /= cA[c]; fl[c] = clamp(fl[c] / cA[c], 0, 1); pv[c] /= cA[c]; }
      this.ref[c] = PL3.REF_MAX / (1 + Math.exp(-(pv[c] - PL3.PVI_HALF) / PL3.PVI_STEEP));
      if (pv[c] < 0.02) this.ref[c] = 0;
      const j0 = G.cell0[c], n = G.nL[c], top = G.depthMax[c] - this._canopy[c];
      for (let k = 0; k < n; k++) { const j = j0 + k; ch.plantRef[j] = G.zMid[j] >= top - 0.25 ? this.ref[c] : 0; }
    }
  }
  // fish cover at column c: the share of a searching predator's strikes the stems foil (1 − 1/(1 + (S/S50)³))
  coverAt(c) { if (c < 0) return 0; const s = this.stems[c] / PL3.S50; return 1 - 1 / (1 + s * s * s); }
}
