# test/diag — food-web diagnostics (not part of the gate)

Long-running probes used to calibrate the zooplankton fields and the food web against real lakes (2026-10-15 slice; see
`docs/ECOLOGY_RESEARCH.md` and the FEATURES section "zooplankton fields and a food web recalibrated to real lakes"). Each
prints a table to stdout; a sim year takes ~8–10 min on a free core (several in parallel share the CPU).

| Script | What it reports |
|---|---|
| `census.mjs <seed> <years>` | per species, every half-month: fish (n), biomass (kg), young-of-year in schools; each year's spawnings, recruits and immigrants; total kg/ha |
| `habitat.mjs <seed> <years> [species,...]` | where each species' adults live, every half-month, day vs night: depth, height above the bed, share over the littoral / in the stream / in the pond, water °C and O₂ there — for checking against angler and field knowledge |
| `zooflux2.mjs <seed> <years>` | half-monthly zooplankton budget (stock, production, who ate it), YOY schools, adult p, fish census, sunfish condition, worms & scuds |
| `energy.mjs <seed> <years>` | whole-lake monthly audit: zooplankton, insect-larva and worm-and-scud production; what agents and fry eat by food type; yearly g/m² |
| `fryfate.mjs <seed> <years> [species,...]` | young-of-year fates by month: hatched, alive, natural / starved / heat / hypoxia / eaten (by whom), recruits |
| `deaths.mjs <seed> <months>` | monthly death ledger by cause and predator, births, immigrants |
| `dietsp.mjs <seed> <months>` | per-species diet (kg by food type, % body weight a day) |
| `autumn.mjs <seed>` | bed food by depth band (worms & scuds, organic layer, bottom O₂, larvae) vs where sunfish and perch are, through a year |
| `sunbed.mjs <seed> <yf> [days]` | why a species does or doesn't feed on the bed: time within reach, reachable density, gut fill, allowed vs taken |
| `roster.mjs <seed> <years> [species] [days]` | a species' fish at a date (length, sex, maturity, ripeness, condition) and its spawns over the next days |
| `yearling.mjs <seed> [species] [L] [yf] [days] [n]` | plant small fish and follow their growth, p, swimming cost and diet by food type |
| `zooonly.mjs <years> [PA] [PY]` | the zooplankton alone (no fish model) under prescribed predation — a year in about a minute |

Overrides (`ovr.mjs`): `SET=BENTHOS.K_FISH=0.5,BENTHOS.G=0.16/d,SP.sucker.pop.start=0 node test/diag/zooflux2.mjs 1 2` — config
paths, `SP.<species>.<path>` for species.js, and a trailing `/d` for a per-real-day rate. `SRC=file:///…/src/` runs an
alternative copy of the sources (A/B against a snapshot).
