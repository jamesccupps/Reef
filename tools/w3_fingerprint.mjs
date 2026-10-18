// A FINGERPRINT OF THE 3-D FISH after fixed runs on the 1/10 world — to prove a speed-up keeps behaviour bit for bit.
//   node tools/w3_fingerprint.mjs                 (this checkout's src/)
//   node tools/w3_fingerprint.mjs <src root URL>  (another copy: e.g. `git archive HEAD src | tar -x -C <dir>` for the old code)
// Two runs (spring, summer; seed 777, the season's young): four coarse 29-min blocks, 30 s of fine 0.1-s steps → "plain";
// then two minutes with a focus (fidelity by distance) and two more blocks → "mixed+after". Each prints a hash of every
// living fish's and young school's state, their count, and the RNG's next draw. Identical output = identical behaviour.
// (TRUE_SCALE.md T3 part 3: the shape fix, P, the mate search and the drive left both runs identical; the young by
// distance changed "mixed+after" only, by design.)
import { createHash } from 'node:crypto';
const R = process.argv[2] || new URL('../src/', import.meta.url).href;
const { Env3 } = await import(R + 'w3/env3.js'); const { Fish3 } = await import(R + 'w3/fish3.js'); const { GEO } = await import(R + 'w3/geometry.js'); const core = await import(R + 'core.js');
const fpOf = F => {
  const h = createHash('sha1'), L = F.fish.filter(a => a.alive).sort((a, b) => a.id - b.id);
  for (const a of L) h.update(`${a.id},${a.x},${a.y},${a.z},${a.n},${a.W},${a.L},${a.gut},${a.yaw};`);
  for (const q of F.yoy.filter(q => q.alive).sort((a, b) => a.id - b.id)) h.update(`${q.id},${q.x},${q.y},${q.n},${q.W};`);
  return h.digest('hex').slice(0, 16) + ' n' + L.length;
};
for (const [tag, yf] of [['spring', 0.3], ['summer', 0.45]]) {
  core.seed(777); const e = new Env3({ yf0: yf }), F = new Fish3(e, { young: true });
  for (let b = 0; b < 4; b++) { F.step(1752); e.step(1752); }
  let acc = 0; for (let i = 0; i < 300; i++) { F.step(0.1); acc += 0.1; if (acc >= 60) { e.step(acc); acc = 0; } }
  const plain = fpOf(F);
  const [cx, cy] = GEO.NOTES[2].xy; F.setFocus(cx, cy, 20);
  for (let i = 0; i < 1300; i++) { F.step(0.1); acc += 0.1; if (acc >= 60) { e.step(acc); acc = 0; } }
  F.setFocus(null); for (let b = 0; b < 2; b++) { F.step(1752); e.step(1752); }
  console.log(tag, 'plain', plain, '| mixed+after', fpOf(F), '| rand', core.rand());
}
