// tools/paper-v2/batches.mjs: split the entries still without evidence into readers' batches (the v2.0 source pass).
//   node tools/paper-v2/batches.mjs --tier 1 [--weight 40] [--max 10] [--limit 10] [--skip key,key]
// Entries already holding docs/paper/evidence/<key>.json are left out. Each entry weighs its claims to check (citing paragraphs +
// follow-on mentions + code lines, at least 1); batches are packed heaviest first to about --weight claims and at most --max entries,
// so a heavy entry (Cooper 1941 has ~30) goes nearly alone. Open-access and closed entries alternate in the packing order.
// Prints JSON: [{ batch: "t1-01", weight, keys: [...] }, ...].
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const tier = arg('--tier', '1'), W = +arg('--weight', 40), MAX = +arg('--max', 10), limit = +arg('--limit', 999);
const skip = new Set((arg('--skip', '') || '').split(',').filter(Boolean));
const refs = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/paper-v2/out/refs.json'), 'utf8'));
const metaOf = k => { const f = path.join(ROOT, 'tools/paper-v2/out/meta', `${k}.json`); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}; };
const done = k => fs.existsSync(path.join(ROOT, 'docs/paper/evidence', `${k}.json`));
const tiers = tier.split(',').map(Number);
const todo = refs.filter(r => tiers.includes(r.tier) && !done(r.key) && !skip.has(r.key))
  .map(r => ({ key: r.key, w: Math.max(1, r.contexts.length + (r.mentions?.length || 0) + r.code.length), oa: !!(metaOf(r.key).oa?.is_oa || metaOf(r.key).candidate?.oa?.is_oa) }))
  .sort((a, b) => b.w - a.w);
const bins = [];
for (const e of todo) {   // first fit, heaviest first; a bin prefers a mix of open and closed sources
  let b = bins.find(b => b.w + e.w <= W && b.keys.length < MAX && (b.keys.length < 3 || b.oa !== e.oa || b.keys.length < MAX - 2));
  if (!b) { b = { w: 0, keys: [], oa: e.oa }; bins.push(b); }
  b.keys.push(e.key); b.w += e.w; b.oa = e.oa;
}
const out = bins.slice(0, limit).map((b, i) => ({ batch: `t${tier.replace(/,/g, '')}-${String(i + 1).padStart(2, '0')}`, weight: b.w, keys: b.keys }));
console.log(JSON.stringify(out, null, 1));
console.error(`${todo.length} entries without evidence in tier ${tier} (${todo.reduce((s, e) => s + e.w, 0)} claims) → ${bins.length} batches${limit < bins.length ? ` (first ${limit} shown)` : ''}`);
