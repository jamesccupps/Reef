// tools/paper-v2/batches.mjs: split the entries still without evidence into readers' batches (the v2.0 source pass).
//   node tools/paper-v2/batches.mjs --tier 1 [--size 10] [--limit 10] [--skip key,key]
// Entries already holding docs/paper/evidence/<key>.json are left out. Within a tier, the open-access entries (OpenAlex) and the rest
// are dealt round-robin, so each batch mixes quick and slow sources; entries citing the same first author stay apart.
// Prints JSON: [{ batch: "t1-01", keys: [...] }, ...].
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const tier = arg('--tier', '1'), size = +arg('--size', 10), limit = +arg('--limit', 999), skip = new Set((arg('--skip', '') || '').split(',').filter(Boolean));
const refs = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/paper-v2/out/refs.json'), 'utf8'));
const metaOf = k => { const f = path.join(ROOT, 'tools/paper-v2/out/meta', `${k}.json`); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}; };
const done = k => fs.existsSync(path.join(ROOT, 'docs/paper/evidence', `${k}.json`));
const tiers = tier.split(',').map(Number);
const todo = refs.filter(r => tiers.includes(r.tier) && !done(r.key) && !skip.has(r.key));
const oa = [], closed = [];
for (const r of todo) { const m = metaOf(r.key); ((m.oa?.is_oa || m.candidate?.oa?.is_oa) ? oa : closed).push(r.key); }
const order = []; while (oa.length || closed.length) { if (closed.length) order.push(closed.shift()); if (oa.length) order.push(oa.shift()); }
const nb = Math.ceil(order.length / size), batches = Array.from({ length: nb }, () => []);
order.forEach((k, i) => batches[i % nb].push(k));   // dealt across batches, so neighbours in the alphabet (same author) part
const out = batches.slice(0, limit).map((keys, i) => ({ batch: `t${tier.replace(/,/g, '')}-${String(i + 1).padStart(2, '0')}`, keys }));
console.log(JSON.stringify(out, null, 1));
console.error(`${todo.length} entries without evidence in tier ${tier} → ${nb} batches of ≤ ${size}${limit < nb ? ` (first ${limit} shown)` : ''}`);
