// plants3.js — the 3-D lakes' aquatic plants (pure: no DOM; Node and browser). Stage 7a: the weeds as a field on the bed —
// per bed cell and growth form, the living shoots and the storage they overwinter in (rhizomes, tubers, turions; g dry mass
// per m² of that cell's bed), growing with the light at their canopy, the temperature and the nutrients, dying back in autumn,
// with their N and P inside the lakes' closed budgets. What the others read: the zooplankton's refuge in the weed volume
// (chem3 plantRef), the stems that hide small fish (stems per m² per column), the O₂ the beds make by day and use at night,
// the shade floating leaves cast on the bed.
// Research: docs/research_notes/Whole lake 3D fish simulation/macrophytes.md (§8 the parameters per growth form; §7 the
// suggested mechanisms; sources and their weaknesses there).
import { clamp } from '../core.js';
import { GEO, LAND, BROOK, WORLD_TRUE } from './geometry.js';
import { ENV, ICE, SEASON, PLANKTON, CAMP3 } from '../config.js';
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
// sheltered coves, 15–45 m from shore at 0.3–1 m; bulrush stands a little more exposed). Per species too: sub — the bed it roots in, its
// share of each bed cell by the substrate map (E12b, PL3 ROOM): 'mineral' sand and gravel; 'organic' mud and organic muck; 'any' all but
// the boulder–cobble lag; 'stone' boulder–cobble and gravel (the water moss); noBrook — not in the brook's running water (lilies,
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
  // bladderworts (rootless, finely divided, carnivorous; under the lilies).
  // (E12b) THE ROOTED CANOPY'S LIGHT LIMIT is the angiosperms' of Chambers & Kalff 1985: 21 % of the surface's growing-season light at
  // the deepest rooted plants (11 % is the charophytes' — macrophyte_area_cover.md §1; macrophytes.md §2.2): at the sim's Kd ~0.66 /m
  // (Secchi ~3.9) a sparse stand stops at ~2.4 m, the coloured water's 2.0–3.0 m (Canfield's humic Finnish lakes 2.9–3.3). Robbins' was
  // 0.11 and large-leaf's 0.16 — scaled from the Lake George compensation ranks [inf], Robbins' "deeper, presumably by being evergreen
  // and low" (its green winter shoots, carry 0.7, already lower its break-even: r_lim) — which put the canopy to 3.4 m: but Robbins'
  // compensation point is the highest of Lake George's pondweeds (20 µmol against amplifolius' 12), and its 5–7-m colonies in that clear
  // lake (Kd ~0.2–0.27) lie at ~16–35 % of the surface light — the angiosperms' 21 %, not the charophytes' 11 % [inf]. (Bladderworts,
  // rootless, keep 0.15 — Utricularia at 4.1–8.3 % at its Florida limit, Canfield 1985; their depth range caps them at 2.5 m)
  { key: 'ribbonleaf', name: 'Ribbon-leaf pondweed', form: 'SC', sub: 'any', depth: [0.3, 3], lightLim: 0.21, KL: 0.15, Bmax: 80, mu: 0.06, tStart: 8, carry: 0.3,
    N: 2.0, P: 0.15, root: 0.8, hFull: 2.0, stem: 0.5, refuge: 0.8, cover: 0.7, invert: 0.6, look: { col: 0x5b6f2a, w: 0.012, n: 6 } },
  { key: 'largeleaf', name: 'Large-leaf pondweed', form: 'SC', sub: 'organic', noBrook: true, depth: [0.8, 4], lightLim: 0.21, KL: 0.15, Bmax: 130, mu: 0.08, tStart: 5, carry: 0.3,
    N: 2.0, P: 0.15, root: 0.8, hFull: 3.0, stem: 0.8, refuge: 1.0, cover: 1.0, invert: 1.0, look: { col: 0x4f6b2c, w: 0.09, n: 4 } },
  { key: 'robbins', name: "Robbins' pondweed", form: 'SC', sub: 'organic', noBrook: true, depth: [1.2, 5], lightLim: 0.21, KL: 0.10, Bmax: 80, mu: 0.04, tStart: 3, carry: 0.7,
    N: 2.0, P: 0.15, root: 0.8, hFull: 0.4, stem: 0.2, refuge: 0.6, cover: 0.6, invert: 0.8, snail: 1.5, look: { col: 0x3d5a26, w: 0.05, n: 7 } },
  { key: 'bladderwort', name: 'Bladderworts', form: 'SC', sub: 'any', noBrook: true, depth: [0.3, 2.5], lightLim: 0.15, KL: 0.15, Bmax: 50, mu: 0.08, tStart: 10, carry: 0.15,
    N: 2.0, P: 0.15, root: 0.3, prey: 10, hFull: 1.0, stem: 0.1, refuge: 1.0, cover: 0.5, invert: 1.3, look: { col: 0x6d7a32, w: 0.006, n: 10 } },   // (rootless: the flocculent bed it lies in (root 0.3) and its PREY (PL3.PREY_*) feed it N and P — on the water's alone it died out)
  // ROSETTES on the wave-washed sand and gravel: pipewort and water lobelia (lobelia takes its CO₂ from the sediment and sends
  // > 97 % of its O₂ into it; lost on organic mud)
  { key: 'pipewort', name: 'Pipewort', form: 'IS', sub: 'mineral', noBrook: true, depth: [0.1, 1.5], lightLim: 0.37, KL: 0.15, Bmax: 80, mu: 0.008, resp: 0.007, tStart: 3, carry: 0.9, rootO2: 0.6,
    N: 1.5, P: 0.10, root: 0.87, hFull: 0.1, stem: 0.3, refuge: 0.1, cover: 0.2, invert: 0.5, look: { col: 0x5f7a44 } },
  { key: 'lobelia', name: 'Water lobelia', form: 'IS', sub: 'mineral', noBrook: true, depth: [0.3, 1.2], lightLim: 0.43, KL: 0.15, Bmax: 90, mu: 0.005, resp: 0.007, tStart: 3, carry: 0.95, rootO2: 0.95,
    N: 1.5, P: 0.10, root: 0.87, hFull: 0.08, stem: 0.3, refuge: 0.1, cover: 0.2, invert: 0.5, look: { col: 0x4f7040 } },
  // LOW MEADOW: the stoneworts (Nitella — the lakes' only recorded plants) on the deeper mud; water moss (Fontinalis) on the brook's
  // stones
  { key: 'nitella', name: 'Stoneworts (Nitella)', form: 'DM', sub: 'organic', noBrook: true, depth: [1.0, 4.2], lightLim: 0.06, KL: 0.08, Bmax: 30, mu: 0.02, resp: 0.010, tStart: 3, carry: 0.9,
    N: 2.0, P: 0.15, root: 0.3, hFull: 0.2, stem: 0.2, refuge: 0.15, cover: 0.2, invert: 1.0, look: { col: 0x2c4630 } },
  // (E12) THE REST OF THE NEAR-CERTAIN AND LIKELY FLORA (research_notes/Hot Brook populations and water/plant_species_hot_brook.md §2: the
  // region's 151 sites within ~50 km, the soft-water list ranked; Tier B 'near-certain', C 'likely'): each on its form's physiology, its
  // numbers scaled from the form's ranges [inf: no per-species biomass for Sparganium, Isoetes, Eleocharis, Sagittaria — plant_species_traits.md
  // §1 gaps]; each shares its form's room (the photographed fringe stays the fringe: the emergents and floaters keep the lilies' shelter).
  // EMERGENT at the wetland edges (Upper's S end, Lower's N end): water horsetail (6 % of the region's sites; the moose's 9.7 %), bogbean
  // (8.6 %, the fen margin), wiregrass sedge Carex lasiocarpa (5.3 %, the fen mats; sedges the moose's 9.2 %), broad-leaved arrowhead (4 %)
  { key: 'horsetail', name: 'Water horsetail', form: 'EM', sub: 'organic', noBrook: true, depth: [0, 1.0], window: true, core: [0, 0.6], shelter: 6, Bmax: 300, mu: 0.03, tStart: 8, carry: 0.5, standDead: 0.3,
    N: 2.0, P: 0.25, root: 1.0, hFull: 99, stem: 1, refuge: 0.3, cover: 0.4, invert: 0.3, look: { col: 0x4d6b38, w: 0.005, n: 12 } },
  { key: 'bogbean', name: 'Bogbean', form: 'EM', sub: 'organic', noBrook: true, depth: [0, 0.5], window: true, core: [0, 0.3], shelter: 7, Bmax: 250, mu: 0.03, tStart: 6, carry: 0.6, standDead: 0.1,
    N: 2.2, P: 0.16, root: 1.0, hFull: 99, stem: 4, refuge: 0.3, cover: 0.5, invert: 0.3, look: { col: 0x5a7d3a, w: 0.03, n: 3 } },
  { key: 'sedge', name: 'Wiregrass sedge', form: 'EM', sub: 'organic', noBrook: true, depth: [0, 0.3], window: true, core: [0, 0.2], shelter: 7, Bmax: 400, mu: 0.025, tStart: 6, carry: 0.6, standDead: 0.5,
    N: 1.6, P: 0.12, root: 1.0, hFull: 99, stem: 0.5, refuge: 0.3, cover: 0.5, invert: 0.3, look: { col: 0x7a8a42, w: 0.003, n: 16 } },
  { key: 'arrowhead', name: 'Broad-leaved arrowhead', form: 'EM', sub: 'organic', noBrook: true, depth: [0, 0.6], window: true, core: [0, 0.4], shelter: 6, Bmax: 200, mu: 0.035, tStart: 10, carry: 0.4, standDead: 0.1,
    N: 2.4, P: 0.20, root: 1.0, hFull: 99, stem: 3, refuge: 0.3, cover: 0.5, invert: 0.3, look: { col: 0x5f8f3a, w: 0.05, n: 4 } },
  // FLOATING-LEAVED: narrow-leaved bur-reed (6 %; Lambert Lake's 'granitic gravel and silt' — the shallow shores and the brook's mouths:
  // floating ribbons) and floating-leaf pondweed P. natans (Tier B; its elliptic pads at the lilies' outer edge)
  { key: 'burreed', name: 'Narrow-leaved bur-reed', form: 'FL', sub: 'any', depth: [0.2, 1.5], window: true, core: [0.3, 1.0], shelter: 6, Bmax: 80, mu: 0.04, tStart: 8, carry: 0.4, padGraze: 0.03,
    N: 2.5, P: 0.18, root: 0.85, hFull: 99, stem: 1, refuge: 0.3, cover: 0.6, invert: 0.4, look: { col: 0x5d7c36, r: [0.015, 0.04] } },
  { key: 'floatpond', name: 'Floating-leaf pondweed', form: 'FL', sub: 'organic', noBrook: true, depth: [0.5, 2.0], window: true, core: [0.9, 1.7], shelter: 6, Bmax: 70, mu: 0.05, tStart: 8, carry: 0.3, padGraze: 0.05,
    N: 2.2, P: 0.18, root: 0.85, hFull: 99, stem: 1, refuge: 0.4, cover: 0.7, invert: 0.5, look: { col: 0x56762e, r: [0.03, 0.06] } },
  // (Tier C, not added: grassy pondweed P. gramineus and spiral pondweed P. spirillus — "likely" by the region's records, none here; on
  // the recorded pondweeds' room with inferred numbers they reached bed those cannot and took the lakes' stands from 47 % to 51 % of the bed,
  // against the research's 20–30 %)
  // ROSETTES on the sand and gravel: spiny-spored quillwort (4.6 %; deeper than lobelia — a population at 1.8–2.3 m below one at 0.3–1.3 —
  // and the first to go as humic colour rises: in the tea-coloured lakes its light limit is its kin's, ~0.42) and needle spikerush (Eleocharis acicularis
  // turf, the very shallows)
  { key: 'quillwort', name: 'Spiny-spored quillwort', form: 'IS', sub: 'mineral', noBrook: true, depth: [0.2, 1.8], lightLim: 0.42, KL: 0.15, Bmax: 60, mu: 0.006, resp: 0.006, tStart: 3, carry: 0.9, rootO2: 0.8,
    N: 1.5, P: 0.10, root: 0.87, hFull: 0.1, stem: 0.3, refuge: 0.1, cover: 0.15, invert: 0.5, look: { col: 0x46663c } },
  { key: 'spikerush', name: 'Needle spikerush', form: 'IS', sub: 'mineral', depth: [0, 1.0], lightLim: 0.40, KL: 0.15, Bmax: 70, mu: 0.012, resp: 0.008, tStart: 5, carry: 0.6, rootO2: 0.4,
    N: 1.8, P: 0.12, root: 0.87, hFull: 0.08, stem: 0.2, refuge: 0.15, cover: 0.2, invert: 0.6, look: { col: 0x6a8a40 } },
  { key: 'moss', name: 'Water moss (Fontinalis)', form: 'DM', sub: 'stone', brookOnly: true, depth: [0.05, 1.3], lightLim: 0.05, KL: 0.08, Bmax: 40, mu: 0.02, resp: 0.010, tStart: 2, carry: 0.9,
    N: 2.0, P: 0.15, root: 0, hFull: 0.15, stem: 0.2, refuge: 0.15, cover: 0.3, invert: 1.0, look: { col: 0x24402a } },
];
export const NF3 = FORMS3.length;
export const PL3 = {
  RESP: 0.022,          // /day at 20 °C: the shoots' maintenance respiration (0.02–0.024 — CHARISMA, PCLake: canopy plants; Q10 below).
                        //   A species' own `resp` replaces it: the evergreen rosettes (~0.007) and the low meadows (~0.010) are slow
                        //   stress-tolerators — Lobelia grows ~4× slower than Zostera, its leaves and roots live > a year, Isoetes leaves
                        //   turn over 1.5–1.6×/yr (plant_species_traits.md; weed_bed_density.md §5) — and maintenance scales with growth
                        //   capacity [inf: no isoetid dark respiration found]. At the canopy plants' 0.022 they could grow nowhere (their
                        //   best, mu 0.005–0.02, under it): the rosettes and Nitella died out over 3–4 years
  NUT_REF: 0.85,        // the lakes' typical nutrient factor at the plants (summer min(fP, fN) ~0.83–0.88 — scratchpad plants_why): a
                        //   species' losses are set so its growth just pays them at its light limit UNDER THESE NUTRIENTS, as the field's
                        //   limits were measured in real lakes (at 1 every plant stopped short of its observed depth: the canopy to 1.9 m
                        //   against 2–2.7 m in coloured water, Duarte's biomass peak at 1.1 + 0.4·Secchi ≈ 2.4 m — weed_bed_controls.md)
  Q10: 2.5,             // growth and respiration (2–3)
  SLOW: 3,              // growth runs every SLOW-th water update (with SLOW × dt)
  // (E13) MOOSE IN THE SHALLOWS (docs/research_notes/Hot Brook populations and water/birds_mammals_people_evidence.md §Bears, deer and
  // moose): an adult eats 868 g dry of aquatic plants a day (17.4 kg wet — Belovsky & Jordan 1978, Isle Royale), wading belly-deep and
  // diving (16 s dives) on 108 of a summer's 124 days, mid-June to September [the window: June – mid-September, inf]; stoneworts 58 % of
  // it, pondweeds 15.5, water horsetail 9.7, sedges 9.2, spikerush 5.8 %; in New Hampshire belly-deep on yellow pond-lily; sodium-rich
  // plants and shallow lakes preferred (Fraser et al. 1984). MOOSE_N moose use the lakes' shallows [inf: WMD 11 ~0.9 /km² (a snippet);
  // the research's 10–25 using the shores], × the world's share of the real lakes' area. They feed in proportion to what they can reach
  // (MOOSE_Z: all to 1.2 m, none past 2.0 [inf: belly-deep wading]) × their preference by species, and take it ashore: their dung falls
  // on land (none in 65 h of watching moose in ponds) — the plants' N and P leave the lakes (chem3's ledger, outP / outN)
  MOOSE: 0, MOOSE_N: 15, MOOSE_KG: 0.868, MOOSE_YF: [0.26, 0.55], MOOSE_Z: [1.2, 2.0],
  MOOSE_PREF: { nitella: 1, ribbonleaf: 1, largeleaf: 1, robbins: 1, yellowlily: 1, whitelily: 0.8, watershield: 0.6, bulrush: 0.4, pickerelweed: 0.4, bladderwort: 0.3, pipewort: 0.2, lobelia: 0.2,
    horsetail: 1, sedge: 1, spikerush: 1, floatpond: 1, burreed: 0.6, arrowhead: 0.5, bogbean: 0.3, quillwort: 0.2 },   // (E12: water horsetail 9.7 %, sedges 9.2 %, spikerush 5.8 % of Isle Royale's moose diet)
  SPROUT: 0.10,         // /day: storage feeds the new shoots in spring at up to this (CHARISMA ≤ 10 %)
  SEED: 0.5,            // g DW/m² a bare cell in a form's range is colonised to (spores, fragments, seeds: the bed is never sterile)
  YF_STORE: 0.53,       // year-fraction (~Sep 10) from which the shoots reallocate to storage (PCLake: day 259 + 15)
  STORE_RATE: 0.07,     // /day, autumn: shoots → storage (the carry share) and litter (the rest)
  SHADE_FL: 0.9,        // floating leaves at full cover cut the light below them by this
  SELF: 0.01,           // m²/g: a canopy's self-shading (0.006–0.02; PCLake cExtSpVeg 0.01)
  // (E12b) THE LIGHT A SUBMERGED STAND GROWS BY is the mean over its canopy, from its top down to the bed it roots in — the water's
  // attenuation over its height and the canopy's leaves' shade (SELF × the cell's canopy shoots) between: PCLake's integral of the light
  // limitation over the vegetation layer, (1/(kd·h + SELF·B))·ln[(KL + I_top)/(KL + I_bed)] (macrophytes.md §2.2). Was the light at the canopy's TOP (its
  // self-shade a third of SELF·B there): a tall stand's top near the surface paid its whole canopy, so a large-leaf bed seeded at
  // 3.5 m, its top at ~0.5 m, held there and the canopy reached 3.4–3.7 m where the field's limit is the light at the deepest rooted
  // plants' BED (Chambers & Kalff's 21 %). A sparse stand's canopy is short (5 % of hFull), so its mean light is its bed's: lightLim
  // is the light at the bed where a sparse stand's season just pays (the field's Zc), as the calibration below reads it
  // THE WAVES (weed_bed_controls.md §2): the shallowest submerged plants sit at the depth the waves stir the bed to (Chambers 1987:
  // minimum depth vs wave-mixing depth r 0.86, slope 1 and intercept 0; exposure first among the controls of biomass, Hudon et al.
  // 2000): per column zWave from its effective fetch (env3 fetch) — CEM/SPM fetch-limited waves at a STORM_U m/s wind (Hm0, Tp,
  // the deep-water wavelength) and the depth where their orbital velocity at the bed falls to U_CRIT, the speed that moves fine
  // sediment (Håkanson & Jansson 1983): fetch 100 m → 0.13 m, 500 m → 0.45, 2 km → 1.26 (the helper's 1.2–1.3). Shoots in open
  // water shallower than zWave are torn at WAVE_M a day at the top (smoothstep to none at zWave); was a fixed 0.03 × 0.15/(z +
  // 0.15) on every shore under 0.6 m, which kept the canopy dense in the exposed 0.5–1 m band (77–79 %) where the field has bare
  // sand, rosettes and rock
  STORM_U: 10, U_CRIT: 0.10,
  WAVE_M: 0.10,         // /day of the shoots at the top of the wave zone (over the canopy's best net growth, ~0.07: none hold there)
  WAVE_IS: 0.02,        // × for the rosettes: low (5–10 cm), tough and deep-rooted, THE plants of wave-washed sand (Maine's pipewort–lobelia
                        //   lawns at 0.2–1.1 m on mineral soil, MNAP; isoetids increase with exposure, Keddy 1983) — at 0.25 none held, at
                        //   0.05 the lawns under 0.5 m thinned 12 → 6 → 3 % of the band over years 2–4
  WAVE_WIN: 0.15,       // × for the lilies and emergents: their exposure is their SHELTER need (the window forms' growth — set to the
                        //   aerial photos' fringe); the waves on top ~0.015/day at the top of the zone, as the old edge term's 0.01–0.02
  WAVE_DEAD: 0.2,       // × for last year's standing stems (breaking and falling into the bed)
  ICE_SCOUR: 0.5,       // m: shoots shallower than this are lost when the ice forms (ice scour) — not the rosettes', evergreen and
                        //   pressed into the sand (the erosion-resistant small isoetids persist where ice disturbance is heavy,
                        //   Hellsten 2000); the canopy's storage lies in the mud below it
  // (E12b) AND THE ICE'S REACH INTO THE BED: in 25 lakes of southern Quebec and the northeastern US the shallowest submerged plants
  // grew at 0.75–1.25 m, unrelated to slope, exposure or clarity — ice scour eroding the shallowest sediment round the whole shore
  // (Duarte 1987 thesis, ch. III [primary]; Memphremagog's upper limit 0.9 m; weed_bed_controls.md §1, §5: "zero above ~1.0 m (ice)").
  // Under the ice the submerged canopy's and meadow's shoots AND their stores (rhizomes, turions — in the top of that sediment) go
  // with it, all of them shallower than ICE_BED[0], none deeper than ICE_BED[1] (the lakes' range, a ramp); a summer's canopy there
  // regrows only from the propagules (PL3.SEED). Not the rosettes (above) nor the lilies' and emergents' rhizomes, deep in the
  // sheltered coves' muck (the aerial photos' fringe at 0.3–1 m)
  ICE_BED: [0.75, 1.25],
  // THE ANNUAL BUDGET AT THE DEPTH LIMIT: a species' observed depth limit (lightLim) is where a YEAR's growth just pays the year —
  // the summer must regrow what the autumn sheds (1 − carry) and the winter's storage losses — so at its light limit its season's
  // net growth is r_lim = ln(1/(carry·WINTER_KEEP)) / SEASON_D (evergreens: ln(1/EVER_KEEP) / SEASON_D), not zero. Calibrated to a
  // break-even day instead, a pondweed keeping 30 % of its summer's mass lost ground every year at its deep edge (the canopy at
  // 2–3 m 30 → 17 → 12 % of the bed over years 2–4)
  SEASON_D: 110, WINTER_KEEP: 0.9, EVER_KEEP: 0.85,
  // N and P in the sim's units per g DW per % of tissue content (the water's units are abstract: these set the beds' share of
  // the lakes' nutrients — ~10 % of the P at a summer's peak)
  P_UNIT: 0.003, N_UNIT: 0.0028,   // (N:P by mass ~13 in plants vs ~7 in algae — the units carry that ratio)
  DEATH_DISS: 0.25,     // share of a dying shoot's P released dissolved into the water (the rest stays in the bed's store)
  O2_YIELD: 1.07,       // g O₂ per g DW of growth (and of respiration)
  // the effects: the weed volume (PVI) → a zooplankton refuge 0.8 × logistic(PVI: ½ at 20 %); stems → fish cover (a searching
  // predator's capture falls as 1/(1 + (S/S50)³), S50 ~150 stems/m² — Crowder & Cooper 1982; Savino & Stein 1982). BY STAND: a
  // species' shoots / its stand's peak is the share of its cell its stand holds (a form's species share their room), and inside
  // the stand its stems are its peak's (Bmax / g a stem × its cover a stem) — a fish's cover in a cell is Σ share × the stand's
  // cover, not the cover of the cell's mean stems (the cube made a patchy cell's dense half count for little: a third of a cell in
  // a 250-stem bladderwort mat read 0.11, not ~0.27). The weed fauna's reach the same, weighted by the plants it lives on
  REF_MAX: 0.8, PVI_HALF: 0.2, PVI_STEEP: 0.05, S50: 150, S50_FAUNA: 250,   // (S50_FAUNA: littoral3 LIT3.S50 sets it — Littoral3 calls faunaS50())
  SHELTER_R: 200 * GEO.SCALE,   // m (world): a direction is sheltered if land lies within ~200 m real (20 at 1/10)
  // THE BED A SPECIES ROOTS IN (E12b; was a flag — sand and gravel shallower than 1.6 m where no more than 4 of 8 directions were
  // sheltered, mud elsewhere — so every cell of a species' bed was all room): each bed cell's substrate from the E1 map (GEO.sub over
  // the world cells whose bed lies in it: boulder–cobble, gravel, sand, organic muck, mud) and each species' ROOM there, the share of
  // the cell's bed of the kind it roots in (FORMS3 sub) — its stand holds at most that share of the cell (Bs/Bmax ≤ room). Maine's lake
  // plants sort so (pipewort–lobelia on mineral soils under ~1 m, water-lily beds on organic soils at 0.5–1.5 m — MNAP); and NO rooted
  // plant holds the boulder–cobble lag: the EPA NLA's nearshore plots dominated by rock (≥ 40 %) carry 0.15 cover against 0.39–0.40 on
  // silt, organic or sand in the coloured soft-water analogues (macrophyte_area_cover.md §3; Randall et al. 2004: coarse exposed beds
  // 0 %). Hot Brook's shallows are the map's: under 1 m ~20–30 % boulder–cobble, ~15–20 % gravel (the rocky shores, ~60–75 % of the
  // perimeter), and its organic muck along the wetland shores. A species with less than ROOM_MIN of a cell has no stand there
  ROOM_MIN: 0.02,
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
  PREY_SEL: [0.3, 1, 0.2, 1],   // Daphnia, copepods (the littoral crustaceans), rotifers, the small cladocerans (chem3.zooS, E2c: the chydorids
                             //   and Bosmina, the bladderworts' commonest prey)
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
    rigid: { dead: 1, wood: 1, other: 0.15, sp: { pickerelweed: 1, bulrush: 1, nitella: 1, moss: 1, largeleaf: 0.5, robbins: 0.3, horsetail: 1, arrowhead: 0.5, bogbean: 0.3, burreed: 0.3 } },   // (E12's: [inf] by their stems)
    mat: { dead: 0.6, wood: 0.2, other: 0.3, sp: { pipewort: 1, lobelia: 1, bladderwort: 1, moss: 1, robbins: 1, nitella: 0.5, pickerelweed: 0.5, bulrush: 0.5, sedge: 1, spikerush: 1, quillwort: 1, horsetail: 0.5, bogbean: 0.5 } },
    plant: { dead: 0.1, wood: 0, other: 0.2, sp: { ribbonleaf: 1, largeleaf: 1, robbins: 1, bladderwort: 1, pipewort: 1, lobelia: 1, nitella: 0.5, floatpond: 1, quillwort: 0.5, spikerush: 0.5, burreed: 0.5 } },
  },
  SPAWN_HALF: 30,       // structure (stems/m² × cover) at which an index reaches 1 − 1/e: a moderate stand
  WOOD: 60,             // the structure a wooded shore's band of fallen trees and brush gives (as stems/m² × cover)
  WOOD_W: 15 * GEO.SCALE,       // m (world): the band's width from the bank, ~15 m real (1.5 at 1/10)
  WOOD_Z: 2.5,          // m: wood lies in water shallower than this (a column's deepest)
};

const MIX = 1e-9;
// the shoots' Q10 factor from a table (−2 … 40 °C in 0.05° steps, as chem3's): a Math.pow per bed cell every update cost more
// than the arithmetic around it
const QT_TAB = new Float32Array(841); for (let i = 0; i < 841; i++) QT_TAB[i] = Math.pow(PL3.Q10, (i * 0.05 - 2 - 20) / 10);
const qPl = T => { let i = ((T + 2) * 20 + 0.5) | 0; if (i < 0) i = 0; else if (i > 840) i = 840; return QT_TAB[i]; };
// THE LAKES' WEEDS AT THEIR START (generated: tools/hotbrook/build_plants3.mjs → plants3init.js, true/plants3init.js): the model's
// own beds after years grown from a bare seeding, at a lake's opening date. Seeded uniformly — every species at a share of its
// stand in every cell of its range — the first summer was a lawn over the whole bed (Upper 96 %, both lakes' shallows under 2 m
// 83 % in fish cover ≥ 0.5 by August) that then died back where it couldn't hold: lilies on ~10 ha, not the aerial photos' ~2 ha,
// and every species shrinking from June. Used where it fits this world's bed cells (its count and their key); otherwise the
// uniform seeding as before
let PI3 = null;
try { PI3 = (await import(WORLD_TRUE ? './true/plants3init.js' : './plants3init.js')).PI3; } catch { PI3 = null; }
// the generated state's numbers: Uint16, log-spaced over 1e-3–1e4 g DW/m² (0 = none) — 0.025 % steps
export const PI3_LOG = [-3, 7];
export const encodeQ = v => v > 0 ? Math.max(1, Math.min(65535, Math.round((Math.log10(v) - PI3_LOG[0]) / PI3_LOG[1] * 65535))) : 0;
const decodeQ = q => q > 0 ? Math.pow(10, PI3_LOG[0] + q / 65535 * PI3_LOG[1]) : 0;
export class Plants3 {
  constructor(env, { init = true } = {}) {
    this._initOK = init;
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
    // each bed cell's water (the brook's running water or a lake's) and its bed (E12b): the substrate map's shares over the world
    // cells whose bed lies in it (the layer buildColumns3 gives their bed area to) — boulder–cobble, gravel, sand, mud + organic muck
    // (subR, subG, subS, subM); `mineral` a cell whose bed is mostly stone, gravel and sand
    this.brook = new Uint8Array(nb); this.mineral = new Uint8Array(nb);
    this.subR = new Float32Array(nb); this.subG = new Float32Array(nb); this.subS = new Float32Array(nb); this.subM = new Float32Array(nb).fill(1);
    { const at = new Int32Array(G.NCELL).fill(-1), n = new Float64Array(nb), sR = new Float64Array(nb), sG = new Float64Array(nb), sS = new Float64Array(nb), DZ = G.DZ;
      for (let i = 0; i < nb; i++) at[cells[i]] = i;
      for (let q = 0; q < GEO.N; q++) {
        const c = G.colOfFine[q], d = GEO.depth[q]; if (c < 0 || !(d > 0)) continue;
        let k = Math.floor(d / DZ); if (k * DZ >= d) k--; k = Math.min(Math.max(0, k), G.nL[c] - 1);   // (its layer: d in (k·DZ, (k+1)·DZ], the bottom layer all below)
        const i = at[G.cell0[c] + k]; if (i < 0) continue; const u = GEO.sub(q); n[i]++; sR[i] += u.rock; sG[i] += u.grav; sS[i] += u.sand;
      }
      for (let i = 0; i < nb; i++) if (n[i] > 0) { this.subR[i] = sR[i] / n[i]; this.subG[i] = sG[i] / n[i]; this.subS[i] = sS[i] / n[i]; this.subM[i] = Math.max(0, 1 - this.subR[i] - this.subG[i] - this.subS[i]); }
    }
    for (let i = 0; i < nb; i++) { this.brook[i] = G.body[this.col[i]] === BROOK ? 1 : 0; this.mineral[i] = this.subM[i] < 0.5 ? 1 : 0; }
    // each species' ROOM in each bed cell (PL3 ROOM_MIN): the share of the cell's bed of the kind it roots in
    const roomOf = (sub, i) => sub === 'mineral' ? this.subG[i] + this.subS[i] : sub === 'organic' ? this.subM[i] : sub === 'stone' ? this.subR[i] + this.subG[i] : 1 - this.subR[i];
    this.room = FORMS3.map(F => Float32Array.from({ length: nb }, (_, i) => roomOf(F.sub, i)));
    // each species' form (index into PL3.FORMS), for the stand's shared space: a form's species share its room in a cell
    this.formOf = FORMS3.map(F => PL3.FORMS.indexOf(F.form)); this._occ = new Float32Array(PL3.FORMS.length);
    // each column's SHELTER from the waves: how many of 8 directions meet land within SHELTER_R (env3 computes it: ice uses it too)
    this.shelter = env.shelter;
    // per column: the stems (per m², for the fish), the floating-leaf cover, the weed volume's refuge; per water cell: the
    // refuge (chem3.plantRef, read by the zooplankton feeding)
    this.stems = new Float32Array(G.NC); this.flCover = new Float32Array(G.NC); this.pvi = new Float32Array(G.NC);
    // per BED CELL the fish cover its stands give (S50) and the share of its weed fauna a searching fish can reach (S50_FAUNA); per
    // column the cover's area mean (coverAt) — each species' stems inside its stand and the cover and reach they give
    this.cov = new Float32Array(nb); this.reachB = new Float32Array(nb).fill(1); this.covC = new Float32Array(G.NC);
    this._sIn = Float32Array.from(FORMS3, F => F.Bmax / F.stem * F.cover); this._cIn = Float32Array.from(this._sIn, s => 1 - 1 / (1 + (s / PL3.S50) ** 3));
    this.faunaS50(PL3.S50_FAUNA);
    // the spawning structure per column (PL3.SPAWN): the indices, the species' weights per use, the shore's wood
    // (per BED CELL, not per column: a 10-m column on a slope holds its shallow structure and its bare deeper bed — averaged, a
    // perch at 1 m read the deep half's bareness; idxOf maps a chem cell to its bed-cell index here)
    this.idxOf = new Int32Array(G.NCELL).fill(-1); for (let i = 0; i < nb; i++) this.idxOf[cells[i]] = i;
    // (E15, CAMP3) THE PATCHES: the bed under a dock or in a swim area (campfx3 patches) — a share phi of its bed cell whose stands grow by
    // their own light (the dock's shade while it is in) and room: per patch and species its stands' mass over the open bed's beside it (u; the
    // shoots and the stores alike). The cell's mass stays the cell's mean — every other reader unchanged — and its growth the area-weighted
    // growth of the open bed and its patches: exact for the processes that scale with the mass (the waves, the autumn's stores, the ice)
    this._pF = null; if (env.camps && env.camps.patches.length) this._patchInit(env.camps.patches);
    this.spawnS = {}; this._spW = {}; for (const u of Object.keys(PL3.SPAWN)) { this.spawnS[u] = new Float32Array(nb); this._spW[u] = FORMS3.map(F => PL3.SPAWN[u].sp[F.key] ?? PL3.SPAWN[u].other); }
    this.wood = new Float32Array(G.NC); this._spN = 0;
    // (per species, for the per-step O₂ loop: start temperatures, evergreen, the roots' O₂ share, window, canopy height, peak)
    this._tS = Float32Array.from(FORMS3, F => F.tStart); this._ev = Uint8Array.from(FORMS3, F => F.carry > 0.8 ? 1 : 0); this._rO = Float32Array.from(FORMS3, F => F.rootO2 || 0);
    this._isF = FORMS3.map((F, f) => F.rootO2 ? f : -1).filter(f => f >= 0);   // (the rosettes: their lawn)
    this._win = Uint8Array.from(FORMS3, F => F.window ? 1 : 0); this._hF = Float32Array.from(FORMS3, F => F.hFull); this._bM = Float32Array.from(FORMS3, F => F.Bmax);
    this._resp = Float32Array.from(FORMS3, F => F.resp ?? PL3.RESP);   // (each species' maintenance floor)
    this._rLim = Float64Array.from(FORMS3, F => Math.log(1 / (F.carry > 0.8 ? PL3.EVER_KEEP : F.carry * PL3.WINTER_KEEP)) / PL3.SEASON_D);   // (the season's net growth at its light limit)
    // each species' losses (/day at 20 °C): its maintenance floor; for the submerged forms, the loss that its season's growth at its
    // light limit (under NUT_REF) just pays with r_lim to spare — the window forms (lilies, emergents) set by their depth window
    this._lossR = Float64Array.from(FORMS3, (F, f) => { const r = F.resp ?? PL3.RESP; if (F.window) return r; const phi = F.lightLim / (F.lightLim + F.KL) * PL3.NUT_REF; return Math.max(r, (F.mu * phi - this._rLim[f]) / (1 - phi)); });
    this._wvF = Float32Array.from(FORMS3, F => F.form === 'IS' ? PL3.WAVE_IS : F.window ? PL3.WAVE_WIN : 1);   // (each form's share of the waves' tearing)
    // (E12b) the canopy's species (their leaves shade one another and the low forms) and the low forms under it (rosettes, meadow)
    this._sc = Uint8Array.from(FORMS3, F => F.form === 'SC' ? 1 : 0); this._low = Uint8Array.from(FORMS3, F => F.form === 'IS' || F.form === 'DM' ? 1 : 0);
    // (E12b, PL3 ICE_BED) the forms the forming ice scours from the shallow bed (the canopy and the meadow), and each column's ice at the
    // last growth step (a lake opened under ice doesn't scour that winter again)
    this._bedIce = Uint8Array.from(FORMS3, F => F.form === 'SC' || F.form === 'DM' ? 1 : 0); this._iceWas = Float32Array.from(env.ice); this._iceNew = new Uint8Array(G.NC);
    // each column's wave depth (m) from its fetch, and each bed cell's share of the storm waves' force on it
    this.zWave = new Float32Array(G.NC); for (let c = 0; c < G.NC; c++) this.zWave[c] = env.fetch && G.body[c] !== BROOK ? Plants3.waveDepth(env.fetch[c]) : 0;
    this._wv = new Float32Array(nb); for (let i = 0; i < nb; i++) { const zw = this.zWave[this.col[i]], x = zw > 0 ? clamp(this.zb[i] / zw, 0, 1) : 1; const t = clamp((x - 0.5) * 2, 0, 1); this._wv[i] = 1 - t * t * (3 - 2 * t); }
    // (the wood falls from the trees on the bank: NLCD's wooded classes — or in the true world the aerial photos' crowns there, GEO.canopy)
    // (E15, CAMP3: a camp's frontage keeps WOOD_FRONT of its fallen wood — campfx3 woodEdge; _woodFront: the frontage's edges' wood before and after)
    { const FOREST = { evergreen: 1, mixed: 1, deciduous: 1, woody_wet: 1, shrub_wet: 0.5, shrub: 0.3 }, SHRUBW = { shrub_wet: 0.5, shrub: 0.3 }, bank = new Float32Array(G.NC), NX = GEO.NX, NY = GEO.NY, cf = env.camps;
      if (cf) this._woodFront = [0, 0];
      for (let i = 0; i < GEO.N; i++) {
        if (GEO.body[i] === LAND || GEO.body[i] === BROOK) continue;
        const r = Math.floor(i / NX), q = i % NX; let w = 0;
        for (const [dq, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const qq = q + dq, rr = r + dr; if (qq < 0 || rr < 0 || qq >= NX || rr >= NY) continue; const k = rr * NX + qq; if (GEO.body[k] === LAND) { const we = GEO.canopy ? Math.max(GEO.bankTrees(k, k - i), SHRUBW[GEO.CLASSES[GEO.cover[k]]] ?? 0) : FOREST[GEO.CLASSES[GEO.cover[k]]] ?? 0; if (cf && cf.front[i]) { const wc = cf.woodEdge(i, we); this._woodFront[0] += we; this._woodFront[1] += wc; w += wc; } else w += we; } }
        if (!w) continue; const [x, y] = GEO.cellCentre(i), c = env.colAt(x, y); if (c >= 0) bank[c] += w * GEO.CELL * 0.8;
      }
      for (let c = 0; c < G.NC; c++) if (bank[c] > 0) this.wood[c] = PL3.WOOD * clamp(bank[c] * PL3.WOOD_W / G.area[c], 0, 1);   // (on the column's bed cells shallower than WOOD_Z)
    }
    this.ref = new Float32Array(G.NC); this._colA = new Float32Array(G.NC); this._canopy = new Float32Array(G.NC);   // (_canopy: the weeds' height per column, m)
    if (!ch.plantRef) ch.plantRef = new Float32Array(G.NCELL);
    this._n = 0; this.prod = 0; this.litter = 0;
    this.seed();
  }
  // the depth (m) the storm waves stir the bed to over fetch F (m): CEM/SPM fetch-limited growth (Cd = 0.001(1.1 + 0.035U), u* =
  // √Cd·U, x̂ = gF/u*², Hm0 = 0.0413 x̂^½ u*²/g, Tp = 0.751 x̂^⅓ u*/g — USGS UMESC wind–fetch–wave 2012), the deep-water wavelength,
  // and the depth where π·Hm0 / (Tp·sinh(2πh/L)) falls to U_CRIT
  static waveDepth(F) {
    const g = 9.81, U = PL3.STORM_U, us = Math.sqrt(0.001 * (1.1 + 0.035 * U)) * U, x = g * Math.max(F, 1) / (us * us);
    const H = 0.0413 * Math.sqrt(x) * us * us / g, T = 0.751 * Math.cbrt(x) * us / g, L = g * T * T / (2 * Math.PI);
    return L / (2 * Math.PI) * Math.asinh(Math.PI * H / (T * PL3.U_CRIT));
  }
  _wave(i) { return this._wv[i]; }   // (1 above half the wave depth, smoothstep to 0 at it)
  // the key of this world's bed cells (their chem cells and columns) — a generated start must match it
  cellKey() { let h = 2166136261; for (let i = 0; i < this.cells.length; i++) { h = Math.imul(h ^ this.cells[i], 16777619) >>> 0; h = Math.imul(h ^ this.col[i], 16777619) >>> 0; } return h; }
  // a lake's plants at its start: the generated beds where they fit (then reshaped to the date: jump), else each form in its
  // range at the share of its stand the season allows (from storage)
  seed() {
    const yf = this.env.yearFrac(), T = this.env.temp;
    const I = this._initOK ? PI3 : null, done = new Uint8Array(NF3);
    if (I && I.n === this.cells.length && I.key === this.cellKey()) {
      const s = atob(I.q), n = I.n, NS = I.species.length, q = new Uint16Array(n * (2 * NS + 1));
      for (let k = 0; k < q.length; k++) q[k] = s.charCodeAt(2 * k) | (s.charCodeAt(2 * k + 1) << 8);
      I.species.forEach((key, m) => { const f = FORMS3.findIndex(F => F.key === key); if (f < 0) return; done[f] = 1;
        for (let i = 0; i < n; i++) { this.Bs[f][i] = decodeQ(q[(2 * m) * n + i]); this.Br[f][i] = decodeQ(q[(2 * m + 1) * n + i]); } });
      for (let i = 0; i < n; i++) this.dead[i] = decodeQ(q[2 * NS * n + i]);
      this.fromInit = true;
    }
    for (let f = 0; f < NF3; f++) {
      const F = FORMS3[f]; if (done[f]) continue;
      for (let i = 0; i < this.cells.length; i++) {
        if (!this._inRange(F, i, f)) continue;
        const grow = yf > 0.15 && yf < 0.6 && T[this.cells[i]] > F.tStart, m = F.Bmax * this.room[f][i];   // (growing season: part of its stand up; a stand on its share of the bed, E12b)
        this.Br[f][i] = m * 0.15; this.Bs[f][i] = F.carry > 0.8 ? m * 0.3 : grow ? m * 0.15 : m * 0.02;   // (the evergreens — rosettes, Nitella, moss — stand all year at about what they hold (0.2–0.3 of a stand by their second summer); slow growers, ~0.4/yr at best, they would take years to fill in from a sprouting stand)
      }
    }
    if (this.fromInit && Math.abs(((yf - PI3.yf) % 1 + 1.5) % 1 - 0.5) > 0.005) this.jump();   // (generated at PI3.yf: reshaped to this date)
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
  _inRange(F, i, f = FORMS3.indexOf(F)) {
    const z = this.zb[i]; if (z < F.depth[0] || z > F.depth[1]) return false;
    const br = this.brook[i]; if ((F.noBrook && br) || (F.brookOnly && !br)) return false;
    return this.room[f][i] >= PL3.ROOM_MIN;   // (E12b: its kind of bed there)
  }
  // N and P held by the plants (the sim's units) — counted in chem3's inventories
  inventoryP() { let s = 0; for (let f = 0; f < NF3; f++) { const u = FORMS3[f].P * PL3.P_UNIT, Bs = this.Bs[f], Br = this.Br[f]; for (let i = 0; i < this.cells.length; i++) s += (Bs[i] + Br[i]) * u * this.G.bedA[this.cells[i]]; } for (let i = 0; i < this.cells.length; i++) s += this.preyP[i]; return s; }
  inventoryN() { let s = 0; for (let f = 0; f < NF3; f++) { const u = FORMS3[f].N * PL3.N_UNIT, Bs = this.Bs[f], Br = this.Br[f]; for (let i = 0; i < this.cells.length; i++) s += (Bs[i] + Br[i]) * u * this.G.bedA[this.cells[i]]; } for (let i = 0; i < this.cells.length; i++) s += this.preyN[i]; return s; }
  total(f) { let s = 0; const B = this.Bs[f]; for (let i = 0; i < this.cells.length; i++) s += B[i] * this.G.bedA[this.cells[i]]; return s; }   // g DW of shoots

  // ============================================================ step ===================================================
  step(dt) {
    if (++this._n >= PL3.SLOW) { this._grow(dt * this._n); if (PL3.MOOSE) this._moose(dt * this._n); this._n = 0; this._outputs(); }
    this._o2(dt);
  }
  // (E13) the moose's grazing over ds (s): their day's need from the shoots they can reach × their preference, taken ashore
  _moose(ds) {
    const yf = this.env.yearFrac(), [y0, y1] = PL3.MOOSE_YF; if (!(yf >= y0 && yf < y1)) return;
    const G = this.G, ch = this.chem, [z0, z1] = PL3.MOOSE_Z;
    if (this._mooseFa === undefined) { let a = 0; for (let c = 0; c < G.NC; c++) a += G.area[c]; this._mooseFa = a / 6.436e6; this._moosePref = FORMS3.map(F => PL3.MOOSE_PREF[F.key] || 0); this.mooseAte = 0; }
    const want = PL3.MOOSE_N * this._mooseFa * PL3.MOOSE_KG * 1000 * ds / DAY3, pr = this._moosePref;   // (g DW over ds)
    let A = 0; for (let i = 0; i < this.cells.length; i++) { const z = this.zb[i], v = z <= z0 ? 1 : z >= z1 ? 0 : (z1 - z) / (z1 - z0); if (!(v > 0)) continue; const a = G.bedA[this.cells[i]] * v; for (let f = 0; f < NF3; f++) if (pr[f] > 0) A += this.Bs[f][i] * pr[f] * a; }
    if (!(A > 0)) return; const phi = Math.min(0.2, want / A);   // (each reachable stand loses phi × its preference — at most a fifth a step)
    let dP = 0, dN = 0, ate = 0;
    for (let i = 0; i < this.cells.length; i++) { const z = this.zb[i], v = z <= z0 ? 1 : z >= z1 ? 0 : (z1 - z) / (z1 - z0); if (!(v > 0)) continue; const a = G.bedA[this.cells[i]];
      for (let f = 0; f < NF3; f++) { if (!(pr[f] > 0)) continue; const B = this.Bs[f], t = B[i] * phi * pr[f] * v; if (!(t > 0)) continue; B[i] -= t; ate += t * a; dP += t * FORMS3[f].P * PL3.P_UNIT * a; dN += t * FORMS3[f].N * PL3.N_UNIT * a; } }
    this.mooseAte += ate; ch.ledger.outP += dP; ch.ledger.outN += dN;   // (ashore: out of the lakes' budget)
  }
  // GROWTH, PHENOLOGY, DEATH over ds (s): per cell and form
  _grow(ds) {
    const e = this.env, ch = this.chem, G = this.G, T = e.temp, yf = e.yearFrac(), dd = ds / DAY3, kd = ch.attenuation();
    const store = yf >= PL3.YF_STORE && yf < 0.9, spring = yf > 0.1 && yf < PL3.YF_STORE;
    const seasonL = e.lightDay;   // (the season's noon height: the light's share of the summer's)
    let prod = 0, lit = 0;
    const iceNew = this._iceNew, iceWas = this._iceWas; for (let c = 0; c < G.NC; c++) { iceNew[c] = e.ice[c] > 0.5 && iceWas[c] <= 0.5 ? 1 : 0; iceWas[c] = e.ice[c]; }   // (the columns whose ice formed since the last growth step: PL3 ICE_BED)
    const IR = this._ir || (this._ir = FORMS3.map((F, f) => Uint8Array.from({ length: this.cells.length }, (_, i) => this._inRange(F, i, f) ? 1 : 0)));   // (_inRange is the bed's depth, the brook and its substrate: fixed — once)
    if (this._pF) { const dL = this.env.camps ? this.env.camps.dockLight(yf) : 1; for (let k = 0; k < this._pLf.length; k++) this._pLf[k] = this._pKind[k] === 0 ? dL : 1; }   // (E15: the docks' shade while they are in)
    for (let i = 0; i < this.cells.length; i++) {
      const j = this.cells[i], c = this.col[i], A = G.bedA[j], a = ch.a[j], w = ch.w[j], z = this.zb[i], Tj = T[j], pk = this._pF ? this._pF[i] : -1;
      const qT = qPl(Tj), iceCut = 1 - e.iceCut * e.ice[c];
      if (this.dead[i] > 0) {   // last year's stems fall into the bed's organic layer (faster in the ice's and the waves' reach)
        const kF = PL3.DEAD_FALL * (e.ice[c] > 0.5 && z < PL3.ICE_SCOUR && !this.brook[i] ? PL3.DEAD_ICE : 1) + (e.ice[c] < 0.5 && !this.brook[i] ? PL3.WAVE_M * PL3.WAVE_DEAD * this._wave(i) : 0);
        const d = this.dead[i] * Math.min(1, kF * dd); this.dead[i] -= d; ch.sedOM[j] += d * A / a;   // (kF·dd ≪ 1 a growth step)
      }
      // the light at the bed: the surface's day-mean × the ice × the water × the floating leaves' shade — and the CANOPY's own (E12b):
      // its leaves, whichever species, shade the canopy (each canopy species' extinction over its height is PL3 SELF × the cell's
      // canopy shoots, not its own alone — four pondweeds sharing a cell had each self-shaded on a quarter of the leaves, and the
      // cell carried ~4 stands' worth) and the rosettes and the low meadow under it (e^(−SELF × the canopy's shoots): under 80 g
      // DW/m² of pondweed ~45 % of the light beside it. Without it a sand cell held a full rosette lawn AND a full canopy on the same
      // bed: the shade is why isoetids keep to where the canopy can't — the wave-washed, the poor — and lose on mud, macrophytes.md §7.2)
      const [i0, i1] = PL3.ICE_BED, scour = iceNew[c] && !this.brook[i] ? clamp((i1 - z) / (i1 - i0), 0, 1) : 0;   // (the share of this bed the forming ice scours)
      const flShade = 1 - PL3.SHADE_FL * this.flCover[c], occ = this._occ; occ.fill(0); let bSC = 0;
      for (let f = 0; f < NF3; f++) { occ[this.formOf[f]] += this.Bs[f][i] / FORMS3[f].Bmax; if (this._sc[f]) bSC += this.Bs[f][i]; }   // (a form's species share its room)
      const lowShade = Math.exp(-PL3.SELF * bSC);
      for (let f = 0; f < NF3; f++) {
        const F = FORMS3[f], Bs = this.Bs[f], Br = this.Br[f];
        if (!IR[f][i]) { if (Bs[i] + Br[i] > 0) { lit += this._die(f, i, Bs[i] + Br[i], j, A, a, w); Bs[i] = 0; Br[i] = 0; } this.gnet[f][i] = 0; continue; }
        let b = Bs[i];
        // COLONISATION: a bare cell in the form's range gets a propagule (spores, fragments, seeds) — paid for in nutrients
        if (b < PL3.SEED && Br[i] < PL3.SEED && Tj > F.tStart && !store) b += this._take(F, PL3.SEED - b, j, A, a, w);
        // SPRING: storage feeds the shoots from the form's start temperature
        if (spring && Tj > F.tStart && Br[i] > 0) { const s = Math.min(Br[i], Br[i] * PL3.SPROUT * dd); Br[i] -= s; b += s; }
        // GROWTH: the light over the canopy (submerged forms — its mean from the top to the bed, E12b; floating-leaved and emergent
        // leaves are in full light, their growth set by their depth window), the temperature, the nutrients (P from the bed and the
        // water; N from the water). LOSSES: the form's own — respiration and, past it, what the field's light limits imply: epiphyte
        // shading, sloughing, grazing, the cost of next year's stores — set so that its growth just pays them at its light limit
        // (lightLim of the day-mean surface light at a sparse stand's bed): its DEPTH LIMIT emerges there, while plants near the
        // surface grow light-saturated
        const ever = F.carry > 0.8, growing = Tj > F.tStart && (!store || ever);   // (the evergreens — rosettes, Nitella, moss — keep their shoots and grow whenever it is warm and light enough: no autumn reallocation)
        let fL = 0; const lossR = this._lossR[f];   // (the light: only while it grows — the dormant's rate does not use it)
        if (growing && F.window) fL = (z <= F.core[1] ? (z >= F.core[0] ? 1 : clamp((z - F.depth[0]) / Math.max(0.05, F.core[0] - F.depth[0]), 0, 1)) : clamp((F.depth[1] - z) / (F.depth[1] - F.core[1]), 0, 1))
          * clamp(this.shelter[c] - F.shelter + 1, 0, 2) / 2;   // (and the waves: half growth at its shelter, full one direction more)
        else if (growing) {
          const h = Math.min(z, F.hFull * clamp(b / F.Bmax, 0.05, 1)), Itop = iceCut * flShade * (this._low[f] ? lowShade : 1) * seasonL * Math.exp(-kd * (z - h)), ext = kd * h + PL3.SELF * (this._sc[f] ? bSC - Bs[i] + b : b);   // (shares of the surface's: the top; the extinction down to the bed — a canopy species' through all the canopy's leaves)
          fL = ext > 1e-6 ? Math.log((F.KL + Itop) / (F.KL + Itop * Math.exp(-ext))) / ext : Itop / (Itop + F.KL);   // (PL3 SELF: the mean of the light limitation over the canopy)
        }
        const sp = ch.sedP[j], ph = ch.phos[j], nT = ch.nh4[j] + ch.no3[j];
        let fP = (sp * F.root + ph * 4 * (1 - F.root)) / (sp * F.root + ph * 4 * (1 - F.root) + 0.15), fN = nT / (nT + 0.1);
        if (F.prey) {   // the traps: the catch, and its N and P lifting the limits (the credit against a day of full growth's needs)
          if (Tj > PL3.PREY_T && b > 2) this._capture(f, i, b, ds, qT);   // (a stand, not the seed propagules everywhere in its range)
          const day = Math.max(MIX, F.mu * qT * b * A);
          fP = Math.min(1, fP + this.preyP[i] / (day * F.P * PL3.P_UNIT)); fN = Math.min(1, fN + this.preyN[i] / (day * F.N * PL3.N_UNIT));
        }
        const rate = growing ? (F.mu + lossR) * qT * fL * Math.min(fP, fN) - lossR * qT : -lossR * qT * 0.3;   // (/day; dormant: a third)
        let nR = rate > 0 ? rate * Math.max(0, 1 - occ[this.formOf[f]] / this.room[f][i]) : rate;   // (/day, net: space limits the net growth — a good site fills its stand, shared by its form's species, on its share of the bed, E12b)
        if (pk >= 0) nR = this._patchNet(pk, f, i, nR, growing, fL, b, z, kd, qT, Math.min(fP, fN), occ[this.formOf[f]] / this.room[f][i], dd,
          growing && !F.window ? iceCut * flShade * (this._low[f] ? lowShade : 1) * seasonL : 0, this._sc[f] ? bSC - Bs[i] : 0);   // (E15: the bed under a dock or in a swim area)
        let g = nR > 0 ? nR * b * dd : 0;
        if (g > 0) { g = this._take(F, g, j, A, a, w, i); b += g; prod += g * A; }
        this.gnet[f][i] = g / Math.max(MIX, dd);
        if (F.padGraze && g > 0) {   // the pads' grazers eat their share of the production (frass to the bed; bodies to littoral3's surface)
          const eat = Math.min(b, g * F.padGraze); b -= eat; lit += this._die(f, i, eat, j, A, a, w); this.padEaten[c] += eat * A; this.padAte += eat * A;
        }
        let loss = nR < 0 ? -nR * b * dd : 0;
        // and the shallowest beds' wave scour, autumn's reallocation, ice scour
        const br = this.brook[i];   // (the brook: running water, no waves; its moss holds to the stones under the ice)
        if (!br && e.ice[c] < 0.5) { const wv = this._wv[i]; if (wv > 0) loss += PL3.WAVE_M * wv * this._wvF[f] * b * dd; }   // (the storm waves above zWave; none under the ice)
        let stand = 0;
        if (store && b > 0 && !ever) {   // shoots → storage (carry) and litter (the rest; an emergent's standDead share of it stays standing)
          const m = Math.min(b, b * PL3.STORE_RATE * dd);
          Br[i] += m * F.carry; loss += m * (1 - F.carry); b -= m * F.carry;
          if (F.standDead) stand = m * (1 - F.carry) * F.standDead;
        }
        if (e.ice[c] > 0.5 && z < PL3.ICE_SCOUR && !br && F.form !== 'IS') loss += b * Math.min(1, dd);
        if (scour > 0 && this._bedIce[f]) {   // (E12b, PL3 ICE_BED: the ice's reach into the bed as it forms — the scoured share of shoots and stores)
          loss += b * scour; if (Br[i] > 0) { const r = Br[i] * scour; Br[i] -= r; lit += this._die(f, i, r, j, A, a, w); }
        }
        loss = Math.min(loss, b);
        if (loss > 0) {
          const sd = Math.min(stand, loss);   // (the standing dead: their N and P leach now, their body falls later)
          lit += this._die(f, i, loss - sd, j, A, a, w); b -= loss;
          if (sd > 0) { lit += this._die(f, i, sd, j, A, a, w, true); this.dead[i] += sd; }
        }
        Bs[i] = b;
        // storage slowly ages (respiration of the reserves)
        if (Br[i] > 0) { const r = Br[i] * (F.resp ?? PL3.RESP) * 0.1 * qT * dd; Br[i] -= r; lit += this._die(f, i, r, j, A, a, w, true); }
      }
    }
    this.prod += prod; this.litter += lit;
  }
  // ---------- (E15, CAMP3) THE PATCHES: the bed under the docks and in the swim areas (campfx3 patches) ----------
  _patchInit(P) {
    const nb = this.cells.length, n = P.length;
    this._pF = new Int32Array(nb).fill(-1); this._pN = new Int32Array(n).fill(-1); this._pSum = new Float64Array(nb);
    this._pPhi = new Float64Array(n); this._pKind = new Uint8Array(n); this._pCell = new Int32Array(n).fill(-1); this._pLf = new Float64Array(n).fill(1); this._pU = new Float64Array(n * NF3).fill(1);
    P.forEach((p, k) => { const i = this.idxOf[p.j]; if (i < 0) return; this._pCell[k] = i; this._pPhi[k] = p.phi; this._pKind[k] = p.kind; this._pN[k] = this._pF[i]; this._pF[i] = k; this._pSum[i] += p.phi; });
  }
  // the cell's net growth (/day) with its patches: the open bed's nR and each patch's own — the dock's shade on its light (lf, a share of the
  // open bed's: the submerged forms' mean over their own, sparser canopy; the window forms as light-limited plants) and its own room (a
  // thinned patch has room to regrow) — weighted by area × mass; each patch's u moves by its rate over the open bed's (u ∈ [1e-6, 1])
  _patchNet(pk, f, i, nR, growing, fL, b, z, kd, qT, nut, occR, dd, I0, bSCx) {
    const F = FORMS3[f], lossR = this._lossR[f], U = this._pU, PH = this._pPhi, LF = this._pLf, open = 1 - this._pSum[i];
    let num = open * nR, den = open;
    for (let k = pk; k >= 0; k = this._pN[k]) {
      const q = k * NF3 + f, u = U[q], lf = LF[k]; let nk = nR;
      if (growing && (lf < 1 || u < 1)) {
        let fk = fL;
        if (lf < 1) {
          if (F.window) fk = fL * lf * (1 + CAMP3.KL_WIN) / (lf + CAMP3.KL_WIN);
          else { const h = Math.min(z, F.hFull * clamp(u * b / F.Bmax, 0.05, 1)), It = I0 * lf * Math.exp(-kd * (z - h)), ext = kd * h + PL3.SELF * u * (bSCx + b);
            fk = ext > 1e-6 ? Math.log((F.KL + It) / (F.KL + It * Math.exp(-ext))) / ext : It / (It + F.KL); }
        }
        const rk = (F.mu + lossR) * qT * fk * nut - lossR * qT;
        nk = rk > 0 ? rk * Math.max(0, 1 - u * occR) : rk;
      }
      num += PH[k] * u * nk; den += PH[k] * u;
      U[q] = clamp(u * Math.exp((nk - nR) * dd), 1e-6, 1);
    }
    return den > 0 ? num / den : nR;
  }
  // the open bed's share of a cell's mass for species f: the cell's mean = the open bed's × (1 − Σφ + Σφu)
  _patchDen(i, f) { let d = 1 - this._pSum[i]; for (let q = this._pF[i]; q >= 0; q = this._pN[q]) d += this._pPhi[q] * this._pU[q * NF3 + f]; return Math.max(1e-9, d); }
  // PULL the plants of every patch of a kind (the swim areas, campfx3's June): each to `left` of its shoots and stores — taken ashore, their N
  // and P out of the lakes (chem3's ledger, as the moose's); returns the g DW pulled
  pullPatches(kind, left) {
    if (!this._pF) return 0; const G = this.G, ch = this.chem; let rm = 0, dP = 0, dN = 0;
    for (let k = 0; k < this._pPhi.length; k++) {
      const i = this._pCell[k]; if (this._pKind[k] !== kind || i < 0) continue; const A = G.bedA[this.cells[i]];
      for (let f = 0; f < NF3; f++) {
        const q = k * NF3 + f, u = this._pU[q], sh = this._pPhi[k] * u * (1 - left) / this._patchDen(i, f);   // (the share of the cell's mass in the patch's pulled part)
        const ms = this.Bs[f][i] * sh, mr = this.Br[f][i] * sh; this._pU[q] = u * left;
        if (!(ms + mr > 0)) continue; this.Bs[f][i] -= ms; this.Br[f][i] -= mr;
        const m = (ms + mr) * A; rm += m; dP += m * FORMS3[f].P * PL3.P_UNIT; dN += m * FORMS3[f].N * PL3.N_UNIT;
      }
    }
    ch.ledger.outP += dP; ch.ledger.outN += dN; this.pulled = (this.pulled || 0) + rm;
    return rm;
  }
  // the shoots under the patches of a kind and on the open bed beside them in the same cells (g DW over the patches' area): [under, open]
  patchMass(kind) {
    if (!this._pF) return [0, 0]; const G = this.G; let un = 0, op = 0;
    for (let k = 0; k < this._pPhi.length; k++) {
      const i = this._pCell[k]; if (this._pKind[k] !== kind || i < 0) continue; const a = this._pPhi[k] * G.bedA[this.cells[i]];
      for (let f = 0; f < NF3; f++) { const bo = this.Bs[f][i] / this._patchDen(i, f); un += this._pU[k * NF3 + f] * bo * a; op += bo * a; }
    }
    return [un, op];
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
    const clr = F.prey * qT * b * A * (ds / DAY3) / (V * 1000), S = PL3.PREY_SEL, flds = [ch.zooD, ch.zooC, ch.zooR, ch.zooS];   // (volumes the stand clears)
    let wet = 0;
    for (let k = k0; k <= kB; k++) {
      const q = j0 + k;
      for (let t = 0; t < 4; t++) { const fld = flds[t], z0 = fld[q]; if (!(z0 > 0)) continue; const take = z0 * -Math.expm1(-clr * S[t]); fld[q] = z0 - take; wet += take * ch.w[q]; }
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
    const Bs = this.Bs, gn = this.gnet, tS = this._tS, ev = this._ev, rO = this._rO, win = this._win, hF = this._hF, bM = this._bM, R0s = this._resp;
    for (let i = 0; i < this.cells.length; i++) {
      const j = this.cells[i], A = G.bedA[j], Tj = T[j], qT = qPl(Tj);
      let gross = 0, resp = 0, h = 0, root = 0; const z = this.zb[i];
      for (let f = 0; f < NF3; f++) {
        const b = Bs[f][i]; if (!(b > 0)) continue;
        const rr = R0s[f] * qT * b, r = Tj > tS[f] && (!store || ev[f]) ? rr : rr * 0.3, g = (gn[f][i] + rr) * now;   // (the day's gross production, made as the light comes; a dormant shoot respires at a third, as _grow's dormant loss)
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
    st.fill(0); fl.fill(0); pv.fill(0); cA.fill(0); this._canopy.fill(0); this.covC.fill(0);
    const cIn = this._cIn, rIn = this._rIn;
    for (let i = 0; i < this.cells.length; i++) {
      const j = this.cells[i], c = this.col[i], A = G.bedA[j], z = this.zb[i]; cA[c] += A;
      let live = 0, wI = 0, rI = 0;   // (the cell's cover by stand and its fauna's reach, gathered in the species loop below)
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
        live += cov * cIn[f]; const m = b * F.invert; wI += m; rI += m * rIn[f];
        st[c] += b / F.stem * A * F.cover;
        if (F.form === 'FL') fl[c] += cov * A;
        const h = Math.min(z, F.hFull * clamp(b / F.Bmax, 0.05, 1));
        pv[c] += cov * (h / z) * F.refuge * A;
        this._canopy[c] = Math.max(this._canopy[c], F.window ? z : h);
      }
      // the cell's cover by stand (with last year's standing stems over it) and its fauna's reach (weighted by the plants it lives on)
      const ds = this.dead[i] / PL3.DEAD_STEM * PL3.DEAD_COVER / PL3.S50, cd = ds > 0 ? 1 - 1 / (1 + ds * ds * ds) : 0;
      this.cov[i] = 1 - (1 - Math.min(1, live)) * (1 - cd); this.reachB[i] = wI > 0 ? rI / wI : 1; this.covC[c] += this.cov[i] * A;
    }
    for (let c = 0; c < G.NC; c++) {
      if (cA[c] > 0) { st[c] /= cA[c]; fl[c] = clamp(fl[c] / cA[c], 0, 1); pv[c] /= cA[c]; this.covC[c] /= cA[c]; }
      this.ref[c] = PL3.REF_MAX / (1 + Math.exp(-(pv[c] - PL3.PVI_HALF) / PL3.PVI_STEEP));
      if (pv[c] < 0.02) this.ref[c] = 0;
      const j0 = G.cell0[c], n = G.nL[c], top = G.depthMax[c] - this._canopy[c];
      for (let k = 0; k < n; k++) { const j = j0 + k; ch.plantRef[j] = G.zMid[j] >= top - 0.25 ? this.ref[c] : 0; }
    }
  }
  // fish cover at column c: the share of a searching predator's strikes its stands foil, over the column's bed (by stand: above)
  coverAt(c) { return c < 0 ? 0 : this.covC[c]; }
  // the cover of the stands on bed cell jb (a chem cell) — what a fish IN the weeds there has (fish3: within the canopy's height)
  standCover(jb) { const i = jb >= 0 ? this.idxOf[jb] : -1; return i >= 0 ? this.cov[i] : 0; }
  // the weed fauna's reach inside each species' stand at S50 stems/m² (Littoral3 sets its own)
  faunaS50(S50) { this._rIn = Float32Array.from(this._sIn, s => 1 / (1 + (s / S50) ** 3)); if (this.Bs && this._colA && this._canopy) this._outputs(true); }
}
