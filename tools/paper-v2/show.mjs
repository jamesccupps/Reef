// tools/paper-v2/show.mjs: everything a reader needs about one or more ledger entries, from tools/paper-v2/out/{refs,meta}.json:
// the citation, its DOI/URL, Crossref's record, the free copies OpenAlex knows, every sentence of the paper that cites it (with its
// section), every code comment that cites it, the research notes that mention it, and any evidence already written.
//   node tools/paper-v2/show.mjs <key> [<key> ...]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const refs = new Map(J('tools/paper-v2/out/refs.json').map(r => [r.key, r]));
const meta = fs.existsSync(path.join(ROOT, 'tools/paper-v2/out/meta.json')) ? J('tools/paper-v2/out/meta.json') : {};
// the research notes, for "which note took this value" (searched by first author + year)
const NOTES = []; const walk = d => { for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) { const f = `${d}/${e.name}`;
  if (e.isDirectory()) { if (e.name !== 'fetched') walk(f); } else if (/\.md$/.test(e.name)) NOTES.push(f); } };
walk('docs/research_notes'); if (fs.existsSync(path.join(ROOT, 'docs/reports'))) walk('docs/reports');
for (const key of process.argv.slice(2)) {
  const r = refs.get(key); if (!r) { console.log(`\n##### ${key}: NOT IN THE LEDGER`); continue; }
  const mc = path.join(ROOT, 'tools/paper-v2/out/meta', `${key}.json`);   // (the per-entry cache, while meta.mjs is still running)
  const m = meta[key] || (fs.existsSync(mc) ? JSON.parse(fs.readFileSync(mc, 'utf8')) : {});
  console.log(`\n##### ${key}  (tier ${r.tier}; flags: ${r.flags.join(' ') || 'none'})`);
  console.log(`CITATION: ${r.citation}`);
  if (r.doi) console.log(`DOI: https://doi.org/${r.doi}`); if (r.url) console.log(`URL in entry: ${r.url}`);
  if (m.crossref) console.log(`CROSSREF: ${m.crossref.authors.slice(0, 6).join('; ')}${m.crossref.authors.length > 6 ? '; …' : ''} (${m.crossref.year}). ${m.crossref.title}. ${m.crossref.journal} ${m.crossref.volume}${m.crossref.issue ? '(' + m.crossref.issue + ')' : ''}: ${m.crossref.page}. [${m.crossref.publisher}]  check: ${JSON.stringify(m.check || {})}`);
  else if (r.doi) console.log(`CROSSREF: ${m.crossref_status === 404 ? 'DOI NOT FOUND at Crossref' : 'no record (' + (m.crossref_status || 'not looked up') + ')'}`);
  const oa = m.oa || m.candidate?.oa;
  if (oa) console.log(`OPEN ACCESS (OpenAlex): ${oa.is_oa ? oa.status : 'none known'}${oa.pdf?.length ? '\n  pdf: ' + oa.pdf.join('\n  pdf: ') : ''}${oa.pages?.length ? '\n  page: ' + oa.pages.join('\n  page: ') : ''}`);
  if (m.candidate) console.log(`CANDIDATE MATCH (no DOI in the entry; confirm it is the same work): "${m.candidate.title}" ${m.candidate.year} ${m.candidate.first_author} doi:${m.candidate.doi || '—'} (title-word score ${m.candidate.score})`);
  console.log(`CITED IN THE PAPER: ${r.sections.join('; ') || '(no in-text match found — search the parts by hand)'}`);
  for (const c of r.contexts) console.log(`  [${c.where}] …${c.text.replace(/\s+/g, ' ')}…`);
  if (r.code.length) { console.log('CITED IN THE CODE:'); for (const c of r.code) console.log(`  ${c.at}: ${c.text}`); }
  const first = (r.label.split(/ (?:&|et al\.)| \d/)[0] || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), yr = (/(\d{4}[a-z]?|n\.d\.)$/.exec(r.label) || [])[1] || '';
  if (first && yr) { const rx = new RegExp(`${first}[^\\n]{0,60}${yr.replace('.', '\\.')}`);
    const hits = NOTES.filter(f => rx.test(fs.readFileSync(path.join(ROOT, f), 'utf8'))); if (hits.length) console.log(`RESEARCH NOTES THAT CITE IT: ${hits.slice(0, 8).join(' · ')}${hits.length > 8 ? ` (+${hits.length - 8})` : ''}`); }
  const ev = path.join(ROOT, 'docs/paper/evidence', `${key}.json`); if (fs.existsSync(ev)) console.log(`EVIDENCE ALREADY WRITTEN: docs/paper/evidence/${key}.json`);
  const ft = path.join(ROOT, 'docs/research_notes/fetched/v2', `${key}.txt`); if (fs.existsSync(ft)) console.log(`FULL TEXT ALREADY FETCHED: docs/research_notes/fetched/v2/${key}.txt`);
}
