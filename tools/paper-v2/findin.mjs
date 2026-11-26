// tools/paper-v2/findin.mjs: search a fetched source's text by page (after getsrc.mjs).
//   node tools/paper-v2/findin.mjs <key> "<regex>" [-C <lines>] [--raw]   case-insensitive; prints "p. N | line" with context
//   node tools/paper-v2/findin.mjs <key> --page <N> [--raw]                 prints one whole page
//   node tools/paper-v2/findin.mjs <key> --image <N> [--clip x0,y0,x1,y1]   renders PDF page N to a PNG (open it with the Read tool)
// --raw searches <key>.raw.txt, where each table row is in printed order: read table values there or on the page image, never from
// the layout text alone (its rows can drift against their labels). Page headers read "p. N" or "p. N (printed 1521)".
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const RAW = argv.includes('--raw'); if (RAW) argv.splice(argv.indexOf('--raw'), 1);
const [key, pat, ...opt] = argv;
if (pat === '--image') {
  const a = ['tools/paper-v2/pdfpage.py', key, String(opt[0])]; const ci = opt.indexOf('--clip'); if (ci >= 0) a.push('--clip', opt[ci + 1]);
  try { console.log(execFileSync('py', ['-3.13', ...a], { cwd: ROOT }).toString().trim()); } catch (e) { console.error(String(e.stderr || e.message)); process.exit(1); }
  process.exit(0);
}
const f = path.join(ROOT, 'docs/research_notes/fetched/v2', `${key}${RAW ? '.raw' : ''}.txt`);
if (!key || !pat || !fs.existsSync(f)) { console.error(`usage: findin.mjs <key> "<regex>" [-C n] [--raw] | <key> --page N [--raw] | <key> --image N   (${path.relative(ROOT, f)} ${fs.existsSync(f) ? 'exists' : 'missing'})`); process.exit(2); }
const lines = fs.readFileSync(f, 'utf8').split('\n');
let page = '?'; const pg = lines.map(l => { const m = /^=== p\. (\d+)((?: \(printed \d+\))?) ===/.exec(l); if (m) page = m[1] + m[2]; return page; });
if (pat === '--page') { const n = String(opt[0]); console.log(lines.filter((_, i) => pg[i].split(' ')[0] === n).join('\n')); process.exit(0); }
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
console.log(`(${hits} matching line${hits === 1 ? '' : 's'}${hits > 60 ? ', first 60 shown' : ''}${RAW ? '; raw order' : '; layout order — check table values with --raw or --image'})`);
