// tools/paper-v2/check_evidence.mjs: validate the source pass's evidence files (docs/paper/evidence/<key>.json; format in
// tools/paper-v2/READER.md). Every file must parse, name a ledger key, use the allowed statuses and verdicts, give a page-level
// location and a quote of at most 15 words for every claim it confirms or corrects, and list what was tried when it is blocked.
//   node tools/paper-v2/check_evidence.mjs [<key> ...]     (no keys: every file) — exits 1 on any error
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = path.join(ROOT, 'docs/paper/evidence');
const keys = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/paper-v2/out/refs.json'), 'utf8')).map(r => r.key));
export const STATUS = ['read-full', 'read-part', 'abstract-only', 'secondary-only', 'unobtainable'];
export const VERDICT = ['confirmed', 'corrected', 'unsupported', 'removed', 'blocked'];
const CLAIM_V = ['confirmed', 'corrected', 'unsupported', 'unchecked'];
const words = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;

export function check(e, file = '') {
  const err = [], warn = [];
  if (!e || typeof e !== 'object') return { err: ['not a JSON object'], warn };
  if (!keys.has(e.key)) err.push(`key "${e.key}" is not in the ledger`);
  if (file && path.basename(file, '.json') !== e.key) err.push(`file name ≠ key "${e.key}"`);
  if (!STATUS.includes(e.status)) err.push(`status "${e.status}" not one of ${STATUS.join('/')}`);
  if (!VERDICT.includes(e.verdict)) err.push(`verdict "${e.verdict}" not one of ${VERDICT.join('/')}`);
  if (/^read-/.test(e.status) && !(e.obtained && (e.obtained.url || e.obtained.file))) err.push('read-* needs obtained.url or obtained.file');
  if (e.status === 'unobtainable' && !(Array.isArray(e.tried) && e.tried.length)) err.push('unobtainable needs tried[] (each URL and what it returned)');
  if (e.status === 'unobtainable' && e.verdict !== 'blocked') warn.push('unobtainable but verdict is not "blocked"');
  if (!e.bibliography || typeof e.bibliography.ok !== 'boolean') err.push('bibliography.ok (true/false) missing');
  else if (e.bibliography.ok === false && !e.bibliography.corrections) err.push('bibliography.ok false needs corrections');
  if (!Array.isArray(e.claims)) err.push('claims[] missing');
  else e.claims.forEach((c, i) => {
    const at = `claims[${i}]`;
    if (!c.paper) err.push(`${at}.paper (the section, e.g. "§4.3") missing`);
    if (!c.claim) err.push(`${at}.claim missing`);
    if (!CLAIM_V.includes(c.verdict)) err.push(`${at}.verdict "${c.verdict}" not one of ${CLAIM_V.join('/')}`);
    if (['confirmed', 'corrected'].includes(c.verdict)) {
      if (!c.location || !/\b(p\.|pp\.|page|table|fig|eq|section|§|para|line|web page)/i.test(c.location)) err.push(`${at}.location must be page-level (p. N, Table N, Fig. N, eq. N)`);
      if (!c.quote) err.push(`${at}.quote missing`); else if (words(c.quote) > 15) err.push(`${at}.quote is ${words(c.quote)} words (max 15)`);
      if (c.verdict === 'corrected' && !c.source_value) err.push(`${at}.source_value needed for a correction`);
    }
    if (c.verdict === 'unsupported' && !c.note) warn.push(`${at}: unsupported without a note saying what the source does say`);
  });
  if (/^read-/.test(e.status) && Array.isArray(e.claims) && e.claims.length === 0) warn.push('read but no claims recorded');
  return { err, warn };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const want = process.argv.slice(2);
  const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => f.endsWith('.json') && (!want.length || want.includes(f.replace(/\.json$/, '')))) : [];
  let bad = 0;
  for (const k of want) if (!files.includes(`${k}.json`)) { console.log(`MISSING ${k}: no docs/paper/evidence/${k}.json`); bad++; }
  for (const f of files) {
    let e; try { e = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch (x) { console.log(`ERROR ${f}: invalid JSON (${x.message})`); bad++; continue; }
    const { err, warn } = check(e, f);
    if (err.length) { bad++; console.log(`ERROR ${f}:\n  - ${err.join('\n  - ')}`); }
    if (warn.length) console.log(`warn  ${f}: ${warn.join('; ')}`);
  }
  console.log(`${files.length} evidence file(s) checked, ${bad} with errors`);
  process.exit(bad ? 1 : 0);
}
