// tools/paper-v2/meta.mjs: each reference's published record and where a free copy is (the v2.0 source pass, Phase 1).
// For an entry with a DOI: Crossref's record (authors, title, year, journal, volume, issue, pages — the brief's check of every
// bibliographic detail) and OpenAlex's open-access locations. For an entry without one: an OpenAlex title search in its year,
// kept as a CANDIDATE (a reader confirms it). Neither service is sent anything but the DOI or title words — no email, no login.
// Responses are cached one file per entry in tools/paper-v2/out/meta/ (git-ignored), so a run resumes where it stopped.
// Writes tools/paper-v2/out/meta.json (key → record + comparison with the entry) and prints a summary.
// Run: node tools/paper-v2/meta.mjs [--refresh | --retry-oa]   (--retry-oa: redo the entries whose OpenAlex lookup failed)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'tools/paper-v2/out'), CACHE = path.join(OUT, 'meta');
fs.mkdirSync(CACHE, { recursive: true });
const refs = JSON.parse(fs.readFileSync(path.join(OUT, 'refs.json'), 'utf8'));
const REFRESH = process.argv.includes('--refresh'), RETRY_OA = process.argv.includes('--retry-oa');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = { 'User-Agent': 'synapse-reef-paper-check/1.0 (source verification script)' };

async function get(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (r.status === 404) return { status: 404 };
      if (r.status === 429 || r.status >= 500) { await sleep(2000 * (i + 1)); continue; }
      if (!r.ok) return { status: r.status };
      return { status: 200, json: await r.json() };
    } catch (e) { await sleep(1500 * (i + 1)); }
  }
  return { status: 'error' };
}
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
// the entry's title: the text after "YEAR. " up to the next sentence end before the journal (italics) or the end
const titleOf = cit => { const m = /\s(?:(?:1[5-9]|20)\d{2}[a-z]?(?:\s\([^)]*\))?|n\.d\.)\.\s+(.+?)(?:\.\s+\*|\.\s+(?:In|Pp?\.|M\.S\.|Ph\.D\.|U\.S\.|Report)\b|\.\s+https?:|\.\s*$|\.\s+doi:)/.exec(cit); return m ? m[1].replace(/\*/g, '') : ''; };
const oaOf = w => {
  if (!w) return null;
  const locs = (w.locations || []).filter(l => l && (l.pdf_url || l.landing_page_url) && (l.is_oa));
  return { is_oa: !!w.open_access?.is_oa, status: w.open_access?.oa_status || '', oa_url: w.open_access?.oa_url || '',
    pdf: [...new Set(locs.map(l => l.pdf_url).filter(Boolean))].slice(0, 4), pages: [...new Set(locs.map(l => l.landing_page_url).filter(Boolean))].slice(0, 4) };
};

const results = {};
let n = 0;
for (const r of refs) {
  n++;
  const cf = path.join(CACHE, `${r.key}.json`);
  if (!REFRESH && fs.existsSync(cf)) {
    const c = JSON.parse(fs.readFileSync(cf, 'utf8'));
    // --retry-oa: redo the entries whose OpenAlex lookup failed (its free daily budget, shared by the network, ran out on 2026-11-26)
    // (and an entry whose DOI has changed since it was cached — the old parser cut SICI DOIs at their first bracket — is redone)
    const stale = (c.doi || '') !== (r.doi || '');
    if (!stale && !(RETRY_OA && c.openalex_status !== undefined && c.openalex_status !== 200 && c.openalex_status !== 404)) { results[r.key] = c; continue; }
  }
  const rec = { key: r.key, doi: r.doi || '', entry_title: titleOf(r.citation), entry_year: (/_(\d{4})/.exec(r.key) || [])[1] || '' };
  if (r.doi) {
    const c = await get(`https://api.crossref.org/works/${encodeURIComponent(r.doi)}`);
    rec.crossref_status = c.status;
    if (c.json) { const m = c.json.message;
      rec.crossref = { title: (m.title || [])[0] || '', authors: (m.author || []).map(a => [a.family, a.given].filter(Boolean).join(', ')), year: (m.issued?.['date-parts']?.[0]?.[0]) || (m.published?.['date-parts']?.[0]?.[0]) || '',
        journal: (m['container-title'] || [])[0] || '', volume: m.volume || '', issue: m.issue || '', page: m.page || '', type: m.type || '', publisher: m.publisher || '' }; }
    await sleep(150);
    const o = await get(`https://api.openalex.org/works/https://doi.org/${r.doi}?select=id,title,publication_year,open_access,best_oa_location,locations,biblio,type`);
    rec.openalex_status = o.status; rec.oa = oaOf(o.json); rec.openalex_id = o.json?.id || '';
    await sleep(120);
  } else if (rec.entry_title && rec.entry_title.split(' ').length >= 4) {
    const words = norm(rec.entry_title).split(' ').slice(0, 14).join(' ');
    const yr = rec.entry_year ? `,publication_year:${Number(rec.entry_year) - 1}-${Number(rec.entry_year) + 1}` : '';
    const o = await get(`https://api.openalex.org/works?filter=title.search:${encodeURIComponent(words)}${yr}&per-page=3&select=id,doi,title,publication_year,open_access,locations,authorships`);
    rec.openalex_status = o.status;
    const best = (o.json?.results || []).map(w => ({ w, score: (() => { const a = new Set(norm(w.title).split(' ')), b = norm(rec.entry_title).split(' '); return b.filter(x => a.has(x)).length / Math.max(1, b.length); })() })).sort((a, b) => b.score - a.score)[0];
    if (best && best.score >= 0.75) rec.candidate = { title: best.w.title, year: best.w.publication_year, doi: (best.w.doi || '').replace('https://doi.org/', ''), score: +best.score.toFixed(2),
      first_author: best.w.authorships?.[0]?.author?.display_name || '', oa: oaOf(best.w) };
    await sleep(120);
  }
  // the comparison: the entry against the published record (title words, year, first author)
  if (rec.crossref) {
    const ct = norm(rec.crossref.title), et = norm(rec.entry_title);
    const tw = et ? et.split(' ').filter(x => x.length > 2) : [], hit = tw.filter(x => ct.includes(x)).length;
    rec.check = { title_match: tw.length ? +(hit / tw.length).toFixed(2) : null, year_match: !rec.entry_year || String(rec.crossref.year) === rec.entry_year,
      first_author_match: !rec.crossref.authors[0] || norm(r.citation).startsWith(norm(rec.crossref.authors[0].split(',')[0]).split(' ')[0]) };
  }
  fs.writeFileSync(cf, JSON.stringify(rec));
  results[r.key] = rec;
  if (n % 50 === 0) console.log(`${n}/${refs.length}`);
}
fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(results, null, 1));

const all = Object.values(results), withDoi = all.filter(x => x.doi);
const cr = withDoi.filter(x => x.crossref), oa = all.filter(x => x.oa?.is_oa || x.candidate?.oa?.is_oa);
const bad = cr.filter(x => x.check && (x.check.title_match !== null && x.check.title_match < 0.6 || !x.check.year_match || !x.check.first_author_match));
console.log(`${all.length} entries; ${withDoi.length} with a DOI: Crossref found ${cr.length} (${withDoi.filter(x => x.crossref_status === 404).length} DOIs unknown to Crossref)`);
console.log(`open access somewhere (OpenAlex): ${oa.length}; candidates found for entries without a DOI: ${all.filter(x => x.candidate).length}`);
console.log(`DOI entries whose title, year or first author differ from Crossref: ${bad.length}`);
for (const x of bad.slice(0, 15)) console.log(`  ${x.key}: ${JSON.stringify(x.check)} — Crossref "${x.crossref.title.slice(0, 70)}" ${x.crossref.year}`);
