# Synapse Reef

A browser-based **neuroevolution lake**. The lake is many times the size of the screen, and a camera zooms smoothly from the whole basin down to a single fish.

Six species of fish each think with their own small **recurrent neural network**. They evolve over generations, and also learn within each lifetime, to forage, school, hunt, flee, hide and breed. Their world has seasons, weather, dissolved oxygen, a nitrogen and phosphorus cycle, plankton, evolving water plants, insects, snails and crayfish. Nothing is scripted: behaviour emerges from selection.

**Drag** to pan, **scroll** (or pinch) to zoom, and **click** any fish to follow it and watch its brain fire live. Press **T** for a hands-off cinematic tour.

---

## Run it

**Windows, one click:** double-click **`Synapse Reef.bat`** (opens the lake in your default browser) or **`Synapse Reef - Screensaver.bat`** (the lake alone, full screen, on the relaxed cinematic tour; Esc for the full page, F11 or Alt+F4 to leave). They start the local server in a minimised "Synapse Reef server" window (close it to stop), reuse one that is already running, and need Node.js 18+ or Python 3. The screensaver opens Chrome or Edge as a full-screen app window on its own small profile (`%LocalAppData%\SynapseReef\browser`). Any page can enter the same mode with `#screensaver` on the URL.

Everything runs client-side as plain ES modules. Browsers won't load modules from a `file://` page, so serve the folder over HTTP:

```bash
npm run serve        # = node serve.mjs  ->  http://localhost:8000   (Node 18+)
```

To use a different port, run `node serve.mjs 8080`. There's also a Python twin: `python serve.py` (or `py serve.py` on Windows).

Both servers listen on **localhost only**, refuse directory listings and dotfiles, and send a strict Content-Security-Policy.

There is no build step and no runtime dependencies. Open the URL in a desktop browser (Chrome, Edge, Firefox or Safari). With WebGL2 you get the full GPU look (HDR bloom, volumetric light, lit fish). Without it the app falls back to plain Canvas2D, and it also switches to Canvas2D on its own if the GPU context is lost.

---

## Controls

**Camera**
- **Drag** to pan; **scroll** or **pinch** to zoom, from the whole lake down to one fish.
- **Click a fish** to follow it. Its stats, genes, niche and live brain appear in the right-hand panel.
- **O** frames the whole lake. **F** follows the selected fish. **T** toggles the cinematic tour. **+ / −** zoom. **Esc** deselects.
- The **minimap** (bottom-left) shows the whole lake, agent density and your view rectangle; click it to jump there.

**Simulation**
- **Space** pauses.
- Speeds are **½× / 1× / 2× / 4×**. The timestep is fixed, so faster speeds run more steps per frame instead of skipping physics. Drawing is interpolated between steps, so motion stays smooth at any speed or refresh rate.
- **⤢ Fullscreen** turns the app into an ambient screensaver: relaxed ½× pace, auto-tour and a glanceable stats overlay. Leaving fullscreen restores your previous speed and pause state.
- **Weather**: *Auto* follows the natural cycle, or force Clear, Cloudy, Rain or Storm.
- **Overlays**:
  - **Oxygen map**: low-oxygen dead zones;
  - **Temp map**: summer stratification;
  - **Algae map**: phytoplankton blooms;
  - **Vision**: what the followed fish senses.
- **Temperature units**: click any temperature readout to switch between °F and °C.
- **Scatter food**, **+ Species** (adds a fish seeded from the current best brain of that species) and **Save / Load brains** all respect the lake's population caps. Save / Load brains stores the champion genome of each species in this browser.
- **Export / Import state** saves the *entire* lake as a `.json` file: every fish, genome and learned weight, the plants, particles, water chemistry and the random-number state. Importing resumes **exactly**, and a reloaded lake continues step-for-step like the original. Imports are validated: a damaged or hostile file is rejected without touching the running lake. Saves from older versions migrate, and evolved brains keep their weights.
- **Reset** starts a fresh random lake. Save brains first if you want to keep them.

---

## What you're watching

**The fish.** Six species across a size gradient, each with its own body shape, brain size, senses and diet:

| Species | Role | Eats | Brain (inputs → hidden → outputs) |
|---|---|---|---|
| Minnow  | schooling planktivore | zooplankton, insects | 23 → 12 → 5 |
| Sunfish | littoral omnivore | zooplankton, plants, larvae, insects, snails | 20 → 10 → 5 |
| Catfish | nocturnal bottom feeder | detritus, plants, larvae, crayfish | 17 → 10 → 5 |
| Carp    | benthic grazer | plants, detritus, larvae, snails | 17 → 9 → 5 |
| Bass    | mid-water predator | smaller fish, insects, crayfish | 17 → 9 → 5 |
| Pike    | ambush apex predator | smaller fish, crayfish | 16 → 8 → 5 |

Predation works by **effective size**: a fish can eat prey up to ~85% of its own size, and juveniles and slim-bodied fish are easier to catch. Newborns get a short grace period before their own species can eat them. After that, bass and pike are cannibals, like the real ones.

**The brain.**
- Each fish runs a recurrent network every tick. Every hidden unit has a leaky memory.
- Inputs are its senses:
  - food, threats, prey, the school, oxygen, light and temperature at its depth;
  - a compass and a bearing back to where it was born;
  - a lateral-line *flow* sense that still works in murky water;
  - the size of the nearest prey;
  - its own *hunger* and *fear*.
- It has five outputs: **turn**, **thrust**, and three gated actions: **strike**, **flee** and **hide**.

**Evolution and learning.**
- Each fish inherits its brain plus seven **trait genes**: size, speed, temperature tolerance, fin, eye, body depth and **brain size**. Every gene has a cost, so fins, eyes and neurons all trade off against metabolism.
- Mates are chosen on condition and genes. Breeding is **seasonal**, with clutch sizes that depend on condition, and is held in check by a logistic carrying capacity.
- A trickle of immigrants rescues species that become locally rare.
- During its life a fish also **learns**: a reward-modulated Hebbian rule strengthens the actions that fed it. This learning is *Baldwinian*: offspring inherit the evolved brain, never the learned weights.

**The lake.**
- **Basin and seasons.** The lake is a real basin: a shallow weedy shelf, a steep drop-off and a deep cold basin. Day and night drive light, which fades fast with depth and with turbidity. Seasons stratify the lake in summer, so the deep hypolimnion runs out of oxygen, and it overturns in spring and autumn. Wind, storms and an inflow→outflow current move water and weak swimmers.
- **Chemistry.** Phosphorus and nitrogen cycle through the water:
  - nitrification and denitrification;
  - a sediment that binds phosphorus and releases it when anoxic;
  - a microbial loop that decomposes dissolved organic matter.
- **Food web.**
  - Phytoplankton and nitrogen-fixing **cyanobacteria** compete at the base. A dense surface scum can be toxic.
  - Zooplankton graze the algae and feed the planktivores.
  - Mussels filter the water; snails scrape algae; crayfish scavenge the bed.
  - Insect larvae develop on the bottom and hatch at the surface.
- **Plants.** Water plants are four varieties (pondweed, milfoil, lilies, chara). Each plant carries its own evolving trait genes. They grow, shade one another, die back in autumn and regrow from rootstock in spring. They also provide cover where prey hide from predators.

Expect the population to dip in the first minute, because the starting brains are random, and then recover as foraging evolves.

**Graphics.** The scene is drawn in Canvas2D through the camera, with culling, level of detail and a sprite cache. A WebGL2 stage then adds:
- linear-HDR bloom and an ACES tonemap;
- god-rays, caustics and in-scattered light near the surface;
- refraction, depth of field and a filmic grade;
- directionally lit, mipmapped fish.

---

## Tuning

Balance values live in [`src/config.js`](src/config.js): world size, the calendar, chemistry, plankton, plants, fish behaviour, reproduction and the camera. Per-species values live in [`src/species.js`](src/species.js). Change a number, reload, and watch the ecosystem respond.

`npm run balance [years]` prints a long-run report of the trophic web, oxygen, nutrients and seasons. It is for tuning, not a pass/fail test.

---

## Tests

The simulation core and the camera are pure modules with no DOM, so they run headless in Node:

```bash
npm test                # everything below (the gate)
npm run test:headless   # pure sim + camera: invariants, migrations, exact resume, determinism, perf budget
npm run test:smoke      # browser layer against a DOM stub (renderer, presenter fallback, inspector, UI)
npm run test:ui         # UI escaping/caps/state + the localhost-only server
```

On a busy machine the 60 steps/s performance budget can fail just from CPU contention. `REEF_PERF_MIN=0 npm test` relaxes it; the default stays strict.

---

## Project layout

```
synapse-reef/
├── index.html, styles.css    page + dive-console design (strict CSP, no inline script/style)
├── serve.mjs / serve.py      localhost-only static servers (Node / Python)
├── src/
│   ├── core.js         seeded RNG (+ state save/restore), math, spatial grid, recurrent net, genomes     (pure)
│   ├── config.js       every tunable constant; world size + area scaling                               (pure)
│   ├── species.js      the six species: senses, brains, life history, art; brain layout history       (pure)
│   ├── environment.js  light, seasons, weather, temperature, O₂ / N / P / phyto / cyano / DOM fields  (pure)
│   ├── world.js        the simulation: organisms, step(), validated save/load                           (pure)
│   ├── camera.js       pan / zoom / pinch / follow / cinematic tour / interpolation helpers            (pure)
│   ├── render.js       camera-space Canvas2D renderer: culling, LOD, sprite cache, overlays, minimap (browser)
│   ├── glpost.js       WebGL2 linear-HDR presenter + GL-lit fish, with a Canvas2D fallback          (browser)
│   ├── inspector.js    live neural-net visualizer                                                   (browser)
│   ├── ui.js           HUD, panels, charts, controls                                                (browser)
│   └── main.js         boot, guarded fixed-timestep loop, input                                     (browser)
├── test/               headless.mjs · smoke.mjs · ui-check.mjs · serve-check.mjs · balance.mjs
└── docs/               GRAPHICS_RESEARCH.md (render roadmap) · archive/ (session history)
```

Working notes for contributors (and AI assistants) are in [`CLAUDE.md`](CLAUDE.md), [`SESSION_STATE.md`](SESSION_STATE.md), [`ROADMAP.md`](ROADMAP.md) and the [`AUDIT.md`](AUDIT.md) findings list.

MIT licensed. See [`LICENSE`](LICENSE).
