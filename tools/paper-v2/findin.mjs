// tools/paper-v2/findin.mjs: search a fetched source's text by page (after getsrc.mjs).
//   node tools/paper-v2/findin.mjs <key> "<regex>" [-C <lines>]     case-insensitive; prints "p. N | line" with context
//   node tools/paper-v2/findin.mjs <key> --page <N>                   prints one whole page
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const [key, pat, ...opt] = process.argv.slice(2);
const f = path.join(ROOT, 'docs/research_notes/fetched/v2', `${key}.txt`);
if (!key || !pat || !fs.existsSync(f)) { console.error(`usage: findin.mjs <key> "<regex>" [-C n] | <key> --page N   (${f} ${fs.existsSync(f) ? 'exists' : 'missing'})`); process.exit(2); }
const lines = fs.readFileSync(f, 'utf8').split('\n');
let page = 0; const pg = lines.map(l => { const m = /^=== p\. (\d+) ===/.exec(l); if (m) page = +m[1]; return page; });
if (pat === '--page') { const n = +opt[0]; console.log(lines.filter((_, i) => pg[i] === n).join('\n')); process.exit(0); }
const C = opt[0] === '-C' ? +opt[1] : 1, rx = new RegExp(pat, 'i');
let shown = -1, hits = 0;
lines.forEach((l, i) => {
  if (!rx.test(l)) return; hits++;
  if (hits > 60) return;
  const a = Math.max(0, i - C, shown + 1), b = Math.min(lines.length - 1, i + C);
  if (a > shown + 1) console.log('--');
  for (let j = a; j <= b; j++) console.log(`p. ${pg[j]} | ${j === i ? '>' : ' '} ${lines[j]}`);
  shown = b;
});
console.log(`(${hits} matching line${hits === 1 ? '' : 's'}${hits > 60 ? ', first 60 shown' : ''})`);
