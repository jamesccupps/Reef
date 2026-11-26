// tools/paper-v2/ledger.mjs: the source ledger's skeleton for the paper's v2.0 source pass (PAPER_REWRITE_BRIEF.md, Phase 1).
// It reads docs/paper/references.md (one entry per "- " line under "## References") and, for each entry, gives:
//   key, the full citation, its DOI/URL, the in-text label ("Lawrence et al. 1995"), its flags (cited via, citation incomplete,
//   n.d., sources disagree, no DOI or URL), every section of the paper that cites it (the abstract, §1–6, Table x.y), every line
//   of the model's code whose comment cites it, and the brief's priority tier:
//     1 a model parameter's source (cited in §4, a Table 4.x or the code), 2 behind the abstract, §5.1 or §6,
//     3 flagged (abstract only, search summary, via, second-hand, not re-read, unverified, incomplete, disagree), 4 the rest.
// The columns the source pass fills (how obtained, status, values, locations, quotes, verdict, notes) are kept from an existing
// ledger by key, so the script can be re-run as the paper changes. It also writes tools/paper-v2/out/refs.json: each entry with
// the paper's sentences and the code lines that cite it, for the readers.
// Run: node tools/paper-v2/ledger.mjs [--quiet]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const P = (...a) => path.join(ROOT, ...a);
const read = f => fs.readFileSync(P(f), 'utf8').replace(/\r\n?/g, '\n');
const QUIET = process.argv.includes('--quiet');

// ---------- the reference entries ----------
const refText = read('docs/paper/references.md');
const body = refText.slice(refText.indexOf('## References'));
const lines = body.split('\n').filter(l => l.startsWith('- '));
const YEAR = /\s(?:((?:1[5-9]|20)\d{2}[a-z]?)(?:\s\([^)]*\))?\.|(n\.d\.))(?=\s|$)/;
const SURNAME = /(?:^|,\s|&\s)((?:(?:van|de|der|von|du|da|le|la|den|di|St\.)\s)*\p{Lu}[\p{L}'’\-]+(?:\s\p{Lu}[\p{L}'’\-]+)?),\s(?:\p{Lu}(?:\.|$)|\p{Lu}\p{Ll}+\.?)/gu;
const refs = [];
for (const raw of lines) {
  const cit = raw.slice(2).trim();
  const ym = YEAR.exec(cit);
  const year = ym ? (ym[1] || ym[2]) : '';
  const who = ym ? cit.slice(0, ym.index).trim().replace(/\.$/, '') : cit.split('.')[0];
  const surnames = [...who.matchAll(SURNAME)].map(m => m[1]);
  let label;
  if (surnames.length === 0) {   // an agency or a work listed under its source: its abbreviation in brackets, else its name
    const ab = /\(([A-Z][A-Za-z&.\- ]{1,24})\)\s*$/.exec(who);
    label = (ab ? ab[1] : who.replace(/\s*\([^)]*\)\s*/g, ' ').trim());
  } else label = surnames.length === 1 ? surnames[0] : surnames.length === 2 ? `${surnames[0]} & ${surnames[1]}` : `${surnames[0]} et al.`;
  // a DOI runs to the next space (old SICI DOIs hold brackets and semicolons: 10.1577/1548-8659(1946)76[23:…]2.0.CO;2); a trailing
  // full stop, comma or unbalanced bracket is the citation's, not the DOI's
  let doi = ((/(?:doi:\s?|doi\.org\/)(10\.\d{4,9}\/\S+)/i.exec(cit) || [])[1] || '').replace(/[.,;]+$/, '');
  while (/\)$/.test(doi) && (doi.match(/\(/g) || []).length < (doi.match(/\)/g) || []).length) doi = doi.slice(0, -1).replace(/[.,;]+$/, '');
  const url = (/(https?:\/\/[^\s;)]+[^\s;.,)])/.exec(cit) || [])[1] || '';
  const flags = [];
  if (/Cited via/i.test(cit)) flags.push('cited-via');
  if (/citation incomplete/i.test(cit)) flags.push('incomplete');
  if (year === 'n.d.') flags.push('nd');
  if (/sources disagree/i.test(cit)) flags.push('disagree');
  if (/abstract only|abstract read|abstract-level/i.test(cit)) flags.push('abstract-only');
  if (/search summary/i.test(cit)) flags.push('search-summary');
  if (/not re-read|second-hand|unverified/i.test(cit)) flags.push('second-hand');
  if (!doi && !url) flags.push('no-doi-url');
  refs.push({ cit, year, who, surnames, label, doi, url, flags, first: surnames[0] || label });
}

// keys: Surname[_Surname2|_etal]_Year, made unique in order
const seen = new Map();
for (const r of refs) {
  const base = (r.surnames.length ? [r.surnames[0], r.surnames.length === 2 ? r.surnames[1] : r.surnames.length > 2 ? 'etal' : null] : [r.label])
    .filter(Boolean).join('_').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9_]+/g, '') + '_' + (r.year === 'n.d.' ? 'nd' : r.year);
  const n = (seen.get(base) || 0) + 1; seen.set(base, n);
  r.key = n === 1 ? base : `${base}-${n}`;
}

// ---------- where the paper cites each entry ----------
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const r of refs) {
  const yr = r.year === 'n.d.' ? 'n\\.d\\.' : esc(r.year);
  // the citation as written: "Smith 1990" / "Smith (1990)" (not "Jones & Smith 1990"), "Smith & Jones 1990", "Smith et al. 1990"
  // (or all the names), an agency's label; a possessive and earlier years in a list may come between ("Keast 1980, 1985")
  const S = r.surnames.map(esc), L = `(?<![\\p{L}])`, R = `(?![\\p{L}])`;
  const who = !S.length ? `${L}${esc(r.first)}${R}[^;)\\n]{0,40}?`
    : S.length === 1 ? `(?<!(?:&|and)\\s)${L}${S[0]}${R}(?:\\s+et\\s+al\\.?)?`   // (an entry listing one author may be cited "et al.")
    : S.length === 2 ? `${L}${S[0]}${R}\\s*(?:&|and)\\s*${S[1]}${R}`
    : `${L}${S[0]}${R}(?:\\s+et\\s+al\\.?|,[^;)\\n]{0,90}?(?:&|and)\\s*${S[S.length - 1]}${R})`;
  // (the year not the end of a range: "fishing guides 2016–2024" is not the 2024 chart)
  r.rx = new RegExp(`${who}(?:['’]s)?[\\s,]*\\(?(?:(?:1[5-9]|20)\\d{2}[a-z]?\\s*[,;]\\s*)*(?<![\\d–\\-])${yr}(?![\\d–])`, 'u');
  // code comments abbreviate ("Christensen 1996" for Christensen et al., "Hamon's potential (1961"): the lead author, a short gap
  // without digits or a full stop, the year — counted only where it points to one entry (see the code loop)
  if (S.length) r.rxLoose = new RegExp(`(?<!(?:&|and)\\s)${L}${S[0]}${R}(?:\\s+et\\s+al\\.?)?[^;.\\n\\d]{0,30}?(?<![\\d])${yr}(?![\\d])`, 'u');
}
const PARTS = [['README.md', 'abstract'], ['01_introduction_and_study_system.md'], ['02_synthesis_physical_to_plants.md'],
  ['03_synthesis_fish_to_forest.md'], ['04_model_and_lessons.md'], ['05_discussion.md']];
const cites = new Map(refs.map(r => [r.key, { sections: new Set(), contexts: [], mentions: [] }]));
// the parts are hard-wrapped, so citations are matched in whole paragraphs (and single table rows); each context is the whole
// paragraph or row (up to 3,000 characters), with its file and first line, so a reader sees every claim it makes
const PARAS = [];   // every paragraph and row: { where, at, text } — for the follow-on mentions below
const scan = (text, where, at) => {
  text = text.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();
  if (!text) return;
  PARAS.push({ where, at, text });
  if (!/(1[5-9]|20)\d{2}|n\.d\./.test(text)) return;
  for (const r of refs) {
    if (!r.rx.test(text)) continue;
    const c = cites.get(r.key); c.sections.add(where);
    if (c.contexts.length < 16) c.contexts.push({ where, at, text: text.length > 3000 ? text.slice(0, 3000) + ' […]' : text });
  }
};
for (const [file, fixed] of PARTS) {
  let sec = fixed || '', inAbstract = false, para = [], paraAt = 0, tableAt = null, ln = 0;
  const flush = () => { if (para.length) scan(para.join(' '), tableAt || sec, `docs/paper/${file}:${paraAt}`); para = []; };
  for (const line of read(`docs/paper/${file}`).split('\n')) {
    ln++;
    const h = /^#{1,4}\s+(\d+(?:\.\d+)*)\b/.exec(line);
    if (file === 'README.md') { if (/^## Abstract/.test(line)) inAbstract = true; else if (/^## /.test(line)) { flush(); inAbstract = false; } if (!inAbstract) continue; sec = 'abstract'; }
    if (/^#{1,4}\s/.test(line)) { flush(); tableAt = null; if (h) sec = '§' + h[1]; else if (/^#{1,2}\s+(Data and code|Acknowledg)/.test(line)) sec = 'back matter'; continue; }
    if (!line.trim()) { flush(); continue; }
    const tb = /^\*\*Table ([\d.\-]+)\.?\*\*/.exec(line);
    if (tb) { flush(); tableAt = `Table ${tb[1]}`; }
    if (/^\s*\|/.test(line)) { flush(); scan(line, tableAt || sec, `docs/paper/${file}:${ln}`); continue; }   // a table row on its own
    if (tableAt && !tb && !/^\s*\|/.test(line) && para.length === 0 && !/^\*\*Table/.test(line)) tableAt = null;   // prose after a table
    if (!para.length) paraAt = ln;
    para.push(line);
  }
  flush();
}
// follow-on mentions: paragraphs in a section that cites the entry which name its first author without the year ("Cooper's
// tables", "in Dudley and Trial's model") — the paper often goes on using a source without citing it again
for (const r of refs) {
  const c = cites.get(r.key); if (!c.sections.size || !r.surnames.length) continue;
  // (the author named as the lead, not as someone's co-author, and not starting a citation of another year: "Sørnes & Aksnes 2004"
  // is not Aksnes & Utne)
  const nm = new RegExp(`(?<!(?:&|and|,)\\s)(?<![\\p{L}])${esc(r.first)}(?:['’]s)?(?![\\p{L}])(?![^;.)\\n]{0,25}(?:1[5-9]|20)\\d{2})`, 'u'), seen = new Set(c.contexts.map(x => x.at));
  for (const p of PARAS) if (c.sections.has(p.where) && !seen.has(p.at) && nm.test(p.text) && !r.rx.test(p.text) && c.mentions.length < 8)
    c.mentions.push({ where: p.where, at: p.at, text: p.text.length > 1500 ? p.text.slice(0, 1500) + ' […]' : p.text });
}

// ---------- where the model's code cites each entry ----------
const CODE = [];
const walk = d => { for (const e of fs.readdirSync(P(d), { withFileTypes: true })) { const f = `${d}/${e.name}`;
  if (e.isDirectory()) { if (!/vendor|render3$|true$/.test(e.name)) walk(f); }
  else if (/\.m?js$/.test(e.name) && !/hotbrook_profile|hotbrook3d|far3d|canopy3/.test(e.name)) CODE.push(f); } };
walk('src');
const code = new Map(refs.map(r => [r.key, []]));
for (const f of CODE) {
  const ls = read(f).split('\n');
  ls.forEach((line, i) => {
    if (!/(1[5-9]|20)\d{2}/.test(line) || !/\/\/|\/\*|\*/.test(line)) return;
    // a citation can break across two comment lines ("Persson & ⏎ Brönmark 2002"): match on this line joined to the comment
    // line above, but count it here only if the year is on this line
    const prev = ls[i - 1] && /^\s*\/\//.test(ls[i - 1]) ? ls[i - 1].replace(/^\s*\/\/\s?/, '') : '';
    const line0 = line; line = (prev.slice(-80) + ' ' + line.replace(/^\s*\/\/\s?/, '')).trim();
    const strict = refs.filter(r => r.surnames.length && r.rx.test(line) && !r.rx.test(prev));
    // the abbreviated form: among the entries it could mean (same lead author and year), a strict match wins, then the
    // single-author entry; if it is still ambiguous it is not counted
    const loose = new Map();
    for (const r of refs) if (r.rxLoose && !strict.includes(r) && r.rxLoose.test(line) && !r.rxLoose.test(prev)) { const g = `${r.first}|${r.year}`; (loose.get(g) || loose.set(g, []).get(g)).push(r); }
    const hits = [...strict];
    for (const [g, rs] of loose) { if (strict.some(r => `${r.first}|${r.year}` === g)) continue; const one = rs.length === 1 ? rs : rs.filter(r => r.surnames.length === 1); if (one.length === 1) hits.push(one[0]); }
    for (const r of hits) { const c = code.get(r.key); if (c.length < 10) c.push({ at: `${f}:${i + 1}`, text: (prev ? prev.trim() + ' ⏎ ' : '') + line0.trim().slice(0, 2000) }); }
  });
}

// ---------- tiers ----------
for (const r of refs) {
  const c = cites.get(r.key), s = [...c.sections];
  r.sections = s; r.contexts = c.contexts; r.mentions = c.mentions; r.code = code.get(r.key);
  const inModel = r.code.length > 0 || s.some(x => /^§4(\.|$)|^Table 4/.test(x));
  const inHead = s.some(x => x === 'abstract' || /^§5\.1(\.|$)|^§6(\.|$)/.test(x));
  const flagged = r.flags.some(f => f !== 'no-doi-url') || c.contexts.some(x => /abstract only|search summary|\bvia\b|second-hand|not re-read|unverified|citation incomplete|sources disagree/i.test(x.text));
  r.tier = inModel ? 1 : inHead ? 2 : flagged ? 3 : 4;
}

// ---------- the ledger (keeping the source pass's columns) ----------
const LEDGER = P('docs/paper/source_ledger.csv');
const COLS = ['key', 'label', 'tier', 'citation', 'doi_url', 'flags', 'sections', 'code', 'obtained', 'status', 'values', 'locations', 'quotes', 'verdict', 'notes'];
const KEEP = ['obtained', 'status', 'values', 'locations', 'quotes', 'verdict', 'notes'];
const parseCSV = t => { const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) { const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; }
    else if (ch === '"') q = true; else if (ch === ',') { row.push(f); f = ''; } else if (ch === '\n') { row.push(f); rows.push(row); row = []; f = ''; } else if (ch !== '\r') f += ch; }
  if (f || row.length) { row.push(f); rows.push(row); } return rows; };
const old = new Map();
if (fs.existsSync(LEDGER)) { const [hd, ...rs] = parseCSV(fs.readFileSync(LEDGER, 'utf8')); for (const r of rs) { const o = Object.fromEntries(hd.map((h, i) => [h, r[i] ?? ''])); old.set(o.key, o); } }
// the source pass's evidence files (docs/paper/evidence/<key>.json, tools/paper-v2/READER.md) fill those columns, over the old CSV
const EVD = P('docs/paper/evidence'); let nEv = 0;
if (fs.existsSync(EVD)) for (const f of fs.readdirSync(EVD).filter(f => f.endsWith('.json'))) {
  let e; try { e = JSON.parse(fs.readFileSync(path.join(EVD, f), 'utf8')); } catch { continue; }
  if (!e.key) continue; nEv++;
  const cl = Array.isArray(e.claims) ? e.claims : [];
  old.set(e.key, { ...(old.get(e.key) || {}),
    obtained: [e.obtained?.how, e.obtained?.url].filter(Boolean).join(' — '), status: e.status || '',
    values: cl.map(c => `[${c.paper}] ${c.claim}${c.source_value ? ' → source: ' + c.source_value : ''} (${c.verdict})`).join(' | '),
    locations: cl.map(c => c.location || '—').join(' | '), quotes: cl.map(c => c.quote ? `“${c.quote}”` : '—').join(' | '),
    verdict: e.verdict || '', notes: [e.bibliography && e.bibliography.ok === false ? 'BIB: ' + e.bibliography.corrections : '', e.notes || ''].filter(Boolean).join(' · ') });
}
const csvf = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const out = [COLS.join(',')];
for (const r of refs) {
  const o = old.get(r.key) || {};
  const row = { key: r.key, label: `${r.label} ${r.year}`, tier: r.tier, citation: r.cit, doi_url: r.doi ? `https://doi.org/${r.doi}` : r.url, flags: r.flags.join(' '),
    sections: r.sections.join('; '), code: r.code.map(c => c.at).join('; ') };
  for (const k of KEEP) row[k] = o[k] ?? '';
  out.push(COLS.map(c => csvf(row[c])).join(','));
}
fs.writeFileSync(LEDGER, out.join('\n') + '\n');
fs.mkdirSync(P('tools/paper-v2/out'), { recursive: true });
fs.writeFileSync(P('tools/paper-v2/out/refs.json'), JSON.stringify(refs.map(r => ({ key: r.key, label: `${r.label} ${r.year}`, tier: r.tier, citation: r.cit,
  doi: r.doi, url: r.url, flags: r.flags, sections: r.sections, contexts: r.contexts, mentions: r.mentions, code: r.code })), null, 1));

if (!QUIET) {
  const by = k => refs.reduce((m, r) => (m[r[k]] = (m[r[k]] || 0) + 1, m), {});
  console.log(`${refs.length} entries → docs/paper/source_ledger.csv (${nEv} evidence files merged)`);
  console.log('tiers:', JSON.stringify(by('tier')));
  const fl = {}; for (const r of refs) for (const f of r.flags) fl[f] = (fl[f] || 0) + 1; console.log('flags:', JSON.stringify(fl));
  const unc = refs.filter(r => !r.sections.length);
  console.log(`cited in the code: ${refs.filter(r => r.code.length).length}; never matched in the text: ${unc.length}`);
  if (unc.length) console.log('  e.g. ' + unc.slice(0, 12).map(r => `${r.label} ${r.year}`).join(' · '));
  const dup = refs.filter(r => /-\d+$/.test(r.key)); if (dup.length) console.log(`same author-year keys: ${dup.length} (e.g. ${dup.slice(0, 6).map(r => r.key).join(', ')})`);
}
