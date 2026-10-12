# Kickoff prompt for Claude Code

Paste the block below as your first message to Claude Code, with the project as the working
directory.

---

You are taking over **Synapse Reef**, a neuroevolution ecosystem simulator. Today it's a
six-fish pond rendered in vanilla JavaScript on a 2D `<canvas>`. The vision is much bigger:
a **whole-lake ecosystem** where every organism is driven by its own neural network and many
real ecological processes interact — large, detailed, realistic, emergent, and beautiful to
watch.

**The display goal I care about specifically:** the world should be **much larger**, with a
camera that **zooms smoothly from the entire lake in a single view all the way in to one
organism and its detail** — plus pan and follow. Big-picture overview and fine detail in the
same world, with fluid zoom, and many organisms on screen at a steady frame rate.

**Keep this open — you have wide latitude on how to get there.** The existing code and the
docs (`CLAUDE.md`, `ROADMAP.md`, `SESSION_STATE.md`) are **context and history — what exists
today and why — not constraints you must preserve.** Read them to understand the current
state and the ecosystem vision, then form your own opinion about the best path. In
particular, you are explicitly empowered to:

- **Question the current approach and choose better tools.** If vanilla JS + 2D canvas on a
  single thread isn't the right foundation for this scale, this zoom range, and this many
  agents, say so and pick something better — for example WebGL/WebGPU or instanced/GPU
  rendering, an ECS, GPU compute for the simulation, Web Workers + OffscreenCanvas, a
  rendering library (three.js, PixiJS), a game engine (Godot, Bevy/Rust, Unity), or a
  native/desktop app. **If a different program, framework, or language would serve "large +
  detailed + zoomable + many agents + beautiful" better, make the case — and if you're
  confident, do it**, including a sensible migration path from the current code.
- **Re-architect and optimize freely.** File layout, data structures, the rendering
  technique, even the language/runtime are all yours to change if it serves the goal. Look
  for the better way; don't preserve the current design out of inertia.
- **Treat `ROADMAP.md` as a menu, not a fixed sequence.** It lists ecosystem features and
  ambitions — habitats and depth zonation, the trophic web, water chemistry and nutrient
  cycling, seasons and weather, evolution and life history, cross-boundary life (insects,
  amphibians, birds), stochastic events, and cinematic display. Pull from it and reorder it
  as your judgment dictates.

Principles to carry no matter what stack you land on:

- **Keep the simulation testable, and test it.** Keep simulation logic separable from
  rendering so it can run headless, keep it deterministic enough to reproduce, and maintain
  an automated test plus a performance budget. (If you stay on Node, `node test/headless.mjs`
  is the gate; if you switch stacks, build the equivalent and keep it green.)
- **Verify before claiming a win.** You may not be able to open a browser or GUI in your
  environment — if so, say so plainly, lean on automated tests, and ask me to confirm
  anything visual rather than asserting it works.
- **Don't leave it broken.** Keep something runnable at the end of each session, and write
  down significant decisions (in `SESSION_STATE.md` or whatever you migrate to) so the next
  session has the context.

How to start: review what's there, run the current test to see the baseline, and then come
back to me with your honest assessment and a plan — including whether you'd keep or replace
the stack and why, a concrete first milestone (the large, zoomable, performant world), and
any decisions you need from me. Then build, verifying as you go and telling me what you've
actually checked versus what still needs my eyes. Ask questions whenever it'll lead to a
better result; otherwise use your judgment and show me results.
