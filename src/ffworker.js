// ffworker.js — browser layer (a module Worker). FAST-FORWARD: runs the pure simulation flat out — no rendering, off the
// main thread — on a copy of the lake (the main thread's save), posting progress a few times a second and, at the end or
// on "stop", the lake's save. Saves are exact (load → step ≡ the uninterrupted run, the gate's resume test), so jumping to
// the result is the same lake as stepping it on the main thread, step for step. Imports only the pure sim modules.
import { World } from './world.js';

const DT = 1 / 30;   // the step the browser and the headless gate run
let stop = false;

self.onmessage = e => {
  const m = e.data || {};
  if (m.type === 'stop') { stop = true; return; }
  if (m.type !== 'run') return;
  stop = false;
  let w;
  try { w = new World(); w.load(m.save); } catch (err) { self.postMessage({ type: 'error', message: String(err && err.message || err) }); return; }
  const total = Math.max(1, Math.round(m.seconds / DT)), t0 = performance.now();
  let n = 0;
  const report = done => {
    const env = w.env, el = (performance.now() - t0) / 1000;
    self.postMessage({ type: done ? 'done' : 'progress', steps: n, total, rate: el > 0 ? n / el : 0,
      label: `${env.monthName()} · Year ${Math.floor(env.year) + 1}`, fish: w.agents.length, save: done ? w.toJSON() : undefined });
  };
  const chunk = () => {
    try {
      const until = performance.now() + 250;   // step for ~¼ s, then let a "stop" message in
      while (n < total && !stop && performance.now() < until) { w.step(DT); n++; }
      const done = stop || n >= total;
      report(done);
      if (!done) setTimeout(chunk, 0);
    } catch (err) { self.postMessage({ type: 'error', message: String(err && err.message || err) }); }
  };
  chunk();
};
