# Synapse Reef

A browser-based neuroevolution **lake** — many times the size of the screen, explored
through a camera that zooms smoothly from the whole lake in one view down to a single
fish. Six species each think with their own tiny neural network and evolve — across
generations — to forage, school, hunt, and breed in a living environment of day/night
light, weather, dissolved oxygen, and growing plants. Nothing is scripted: behavior
emerges from selection.

**Drag** to pan, **scroll** to zoom, **click** any fish to follow it and watch its actual
brain fire in real time — or hit **T** for a hands-off cinematic tour.

---

## Run it

The simulation is plain client-side JavaScript (ES modules) drawn on a `<canvas>`.
ES modules can't load from a `file://` page, so it needs to be served over HTTP.
Pick either option, then open the URL in a desktop browser:

```bash
# option A — the bundled server (sets MIME types + disables caching)
python3 serve.py
#   ->  http://localhost:8000

# option B — Python's built-in server
python3 -m http.server 8000
#   ->  http://localhost:8000
```

> A desktop browser is required (Chrome, Firefox, Safari, Edge). The multi-file
> project will not render inside a phone's chat-app preview.

No build step, no dependencies, no backend. The neural nets are small enough that
everything runs in real time on the main thread.

---

## Controls

**Camera**

- **Drag** to pan, **scroll** to zoom (from the whole lake down to one fish).
- **Click a fish** — follow it; its stats and live brain appear in the right rail.
- **O** frame the whole lake · **F** follow the selected fish · **T** toggle the cinematic
  auto-tour · **+ / −** zoom. **Esc** deselects (and returns to the whole-lake view).
- **Minimap** (bottom-left) shows the whole lake, agent density, and the camera's current
  view rectangle — click it to jump there. The camera control bar is bottom-right.

**Simulation**

- **Space** pauses. **Pause / 1× / 2× / 4×** — speed (fixed timestep, so speeding up runs
  more steps per frame rather than skipping physics).
- **Perf HUD** (checkbox) — fps, agents drawn vs. total, sprite/dot counts, sim ms, steps/s,
  zoom, and sprite-cache size.
- **⤢ Fullscreen** — expand the lake to the whole screen with a glanceable stats overlay
  (gen, population, time, weather, oxygen, per-species counts). Esc exits. The cinematic
  auto-tour starts automatically — a true ambient screensaver.
- **Weather** — leave on *Auto* for the natural cycle, or force Clear/Cloudy/Rain/Storm.
- **Oxygen map** — overlays the dissolved-oxygen field (red = low/dead zone, teal = high).
- **Temp map** — overlays the temperature field (blue = cold deep water, amber = warm surface);
  in summer you can see the lake **stratify** into a warm surface layer over a cold deep one.
- **Algae map** — overlays the phytoplankton field (green = dense algae); it bands in the sunlit
  upper water and blooms when nutrients are high.
- **Vision** — draws what the followed fish currently senses (food, threats, prey, and
  its oxygen-gradient cue).
- **Scatter food** — drop a burst of plankton.
- **+ Species** — introduce a fish, seeded from the current best brain of its kind.
- **Save brains / Load brains** — store the best genome per species in this browser
  and re-seed from them later.
- **Export state / Import state** — write or read the *entire* pond (every fish, its
  genome, the plants, and the environment) as a portable `.json` file.
- **Reset** — start a fresh random pond. Save brains first if you want to keep them.

---

## What you're watching

**The fish.** Six species across a size gradient, each with a different brain shape,
diet, and set of senses:

| species | size | role | eats |
|---|---|---|---|
| Minnow  | small  | schooling planktivore | plankton |
| Sunfish | small  | omnivore | plankton + plants |
| Catfish | medium | bottom feeder | detritus + plants |
| Carp    | large  | grazer | plants + detritus |
| Bass    | medium | predator | smaller fish |
| Pike    | large  | apex predator | anything smaller |

Predation is by **size ratio** — a fish can eat prey up to ~85% of its own size — so
the food web is a gradient, not a fixed list. Fish are **born as juveniles and grow**
to full size with age, and smaller juveniles are easier prey.

**The brain.** Each fish runs a small feed-forward network (e.g. `14 → 12 → 2`) every
tick. Inputs are its senses (direction/closeness of nearest food, threats, prey, school
cohesion, local oxygen, energy, walls, depth); outputs are **turn** and **thrust**.
The genome is the flattened weights and biases.

**Evolution.** When two well-fed adults of the same species meet, they breed: the child's
genome is a **uniform crossover** of both parents plus mutation. A well-fed fish that
can't find a mate buds **asexually** as a fallback, so sparse species (and the initial
random population) still evolve. To keep every species on screen, populations are held
above a small floor by re-seeding — mostly mutated copies of that species' current best,
so learned behavior is preserved.

**The environment.** The lake is a real **basin** — shallow weedy shores, a deep cold middle —
and organisms live at preferred depths (minnows up top, catfish on the bottom, pike hunting the
mid-water). A day/night cycle drives light (which drives plankton blooms and plant photosynthesis);
light fades fast with depth, so the deep is dark. A slow **seasonal** cycle warms and cools the
lake: in **summer** it **stratifies** into a warm surface layer over a cold deep one, the deep
**hypolimnion** loses its oxygen (sediment demand + a thermocline that blocks mixing) and becomes
a seasonal dead zone; at spring/autumn **turnover** the layers mix and the deep re-oxygenates.
Weather shifts light, surface mixing, rain, and **wind**; together with a gentle **inflow→outflow
current** it drifts plankton and weak swimmers (the inflow also feeds nutrients into the shallows).
The shallow shores grow **reed beds, weeds, and submerged logs** — **cover** that hides prey from
predators, so the littoral is a refuge. The base of the food web is a **phytoplankton** field —
free-floating algae that grows on light and nutrients, makes oxygen, and clouds the water.
**Zooplankton** graze the algae and are eaten by the small planktivores, so a **phytoplankton →
zooplankton → fish** chain rises and falls; **mussels** on the bed filter algae and clear the water.
Dissolved oxygen is a real 2-D field — plants and algae produce it (more by day), fish and
decomposition consume it (more in warm water), the surface re-aerates — that fish must learn to read.
Let nutrients build up and you get **eutrophication**: an algal bloom that clouds the water and then
crashes the oxygen. Dead fish sink, decay into nutrients, and feed the algae and plants — a closed loop.

Expect the population to **dip during the first minute** (starting brains are random) and
then climb as foraging evolves. Generations keep advancing as long as the sim runs.

---

## Tuning

Every balance knob lives in [`src/config.js`](src/config.js) (world size, day length,
weather, oxygen budget, plankton/plant/detritus rates) and per-species values in
[`src/species.js`](src/species.js) (sizes, brain shapes, metabolism, breeding thresholds,
diets, speeds). Change a number, reload, watch the ecosystem respond.

---

## Tests

The simulation core (and the camera) are pure (no DOM), so they run and are tested in Node:

```bash
npm test          # runs both suites below
npm run test:headless   # pure sim + camera math
npm run test:smoke      # browser layer against a DOM stub
```

- **`test/headless.mjs`** runs a full day/night cycle and asserts there are no NaNs, all
  species persist, generations advance, oxygen stays in range, plants survive grazing,
  save/load round-trips, the world is genuinely larger with area-scaled densities, the sim
  meets its performance budget at scale, and the camera transforms / clamping / follow are
  correct.
- **`test/smoke.mjs`** fakes `document`/`canvas`/`window` and constructs the real
  `Renderer`/`UI`/`Inspector`/`Camera`, drawing at whole-lake, mid, and close-up zoom to
  confirm the browser layer (culling, LOD, sprite cache, minimap, tour, picking) builds and
  draws without throwing. *Visual correctness still needs a human in a real browser.*

---

## Project layout

```
synapse-reef/
├── index.html          page structure
├── styles.css          dive-console visual design
├── serve.py            one-command static server
├── package.json        marks the project as ESM; npm test
├── CLAUDE.md           architecture notes for future work
├── src/
│   ├── core.js         RNG, math, spatial grid, neural net + crossover/mutation  (pure)
│   ├── config.js       tunable constants; world size + area-scaling + camera cfg  (pure)
│   ├── species.js      the six species: data + senses + pixel sprites             (pure)
│   ├── environment.js  day/night, weather, temperature, oxygen + nutrient fields  (pure)
│   ├── world.js        the simulation: entities + step() + save/load              (pure)
│   ├── camera.js       world-space camera: pan/zoom/follow/cinematic tour         (pure)
│   ├── render.js       camera-space renderer: culling, LOD, sprite cache, minimap (browser)
│   ├── inspector.js    live neural-net visualizer                                 (browser)
│   ├── ui.js           HUD, census, charts, minimap, perf HUD, controls           (browser)
│   └── main.js         boot + fixed-timestep loop + camera input                  (browser)
└── test/
    ├── headless.mjs    Node test of the pure sim + camera
    └── smoke.mjs       DOM-stub smoke test of the browser/render layer
```

MIT licensed.
