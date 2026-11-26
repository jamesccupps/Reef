// tools/paper-v2/summary.mjs: where the source pass stands, from docs/paper/evidence/*.json.
//   node tools/paper-v2/summary.mjs            counts: entries by status and verdict, claims by verdict, per tier
//   node tools/paper-v2/summary.mjs --changes  every corrected or unsupported claim (section, claim, source's value, location) —
//                                              the raw material for docs/paper/CHANGES_v2.md
//   node tools/paper-v2/summary.mjs --blocked  every blocked entry with its DOI/URL and what was tried — for the human's fetch list
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const D = path.join(ROOT, 'docs/paper/evidence');
const refs = new Map(JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/paper-v2/out/refs.json'), 'utf8')).map(r => [r.key, r]));
const ev = fs.readdirSync(D).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8')));
const count = (xs, f) => xs.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});

if (process.argv.includes('--changes')) {
  for (const e of ev.sort((a, b) => a.key.localeCompare(b.key))) for (const c of e.claims || []) if (['corrected', 'unsupported'].includes(c.verdict))
    console.log(`| ${c.paper} | ${String(c.claim).replace(/\|/g, '/')} | ${c.verdict === 'corrected' ? String(c.source_value || '').replace(/\|/g, '/') : '(not in the source) ' + String(c.note || '').replace(/\|/g, '/')} | ${e.key}, ${c.location || '—'} |`);
  process.exit(0);
}
if (process.argv.includes('--blocked')) {
  for (const e of ev.filter(e => e.verdict === 'blocked' || e.status === 'unobtainable' || e.status === 'abstract-only').sort((a, b) => a.key.localeCompare(b.key))) {
    const r = refs.get(e.key) || {};
    console.log(`- **${e.key}** (${e.status}; tier ${r.tier ?? '—'}): ${r.citation || ''}\n  ${r.doi ? 'https://doi.org/' + r.doi : r.url || ''}\n  tried: ${(e.tried || []).map(t => `${t.url} → ${t.status}${t.note ? ' (' + t.note + ')' : ''}`).join('; ') || '—'}`);
  }
  process.exit(0);
}
const claims = ev.flatMap(e => e.claims || []);
const tiers = count(ev, e => refs.get(e.key)?.tier ?? 'new');
const allTiers = count([...refs.values()], r => r.tier);
console.log(`evidence files: ${ev.length} of ${refs.size} ledger entries`);
console.log(`  by tier (done / all): ${Object.keys(allTiers).sort().map(t => `${t}: ${tiers[t] || 0}/${allTiers[t]}`).join(' · ')}${tiers.new ? ` · additions: ${tiers.new}` : ''}`);
console.log(`  status: ${JSON.stringify(count(ev, e => e.status))}`);
console.log(`  verdict: ${JSON.stringify(count(ev, e => e.verdict))}`);
console.log(`claims: ${claims.length} — ${JSON.stringify(count(claims, c => c.verdict))}`);
const bib = ev.filter(e => e.bibliography && e.bibliography.ok === false).length;
console.log(`bibliography corrections: ${bib}`);
