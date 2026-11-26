// tools/paper-v2/getsrc.mjs: fetch one source's full text for the v2.0 source pass and make it searchable by page.
//   node tools/paper-v2/getsrc.mjs <key> <url> [<url> ...] [--pages A-B]   tries each URL until one gives a real full text
//   node tools/paper-v2/getsrc.mjs <key> --file <path> [--pages A-B]       uses a file already on disk (e.g. one the human fetched)
// --pages A-B keeps only PDF pages A..B (a whole journal issue: just the article), numbered as in the original PDF.
// Writes docs/research_notes/fetched/v2/<key>.<pdf|html> (git-ignored, never committed) and two texts:
//   <key>.txt      layout order (pdftotext -layout): good for prose, but table rows can drift against their labels;
//   <key>.raw.txt  content order (pdftotext -raw): each table row as printed — read table values here or on the page image.
// Each page starts with "=== p. N ===" (N = the PDF's page index) or "=== p. N (printed 1521) ===" when a printed page number is found
// consistently. It identifies itself honestly and stops at a login, paywall or bot check (it never works around one): such a page,
// or one too short to be the text, is not kept, and the next URL is tried.
// Prints one JSON line: {key, ok, file, txt, raw, kind, pages, chars, scanned, url, tried:[{url,status,note}]}.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = path.join(ROOT, 'docs/research_notes/fetched/v2');
fs.mkdirSync(DIR, { recursive: true });
const argv = process.argv.slice(2);
const pi = argv.indexOf('--pages'); let range = null;
if (pi >= 0) { const m = /^(\d+)-(\d+)$/.exec(argv[pi + 1] || ''); if (!m) { console.error('--pages needs A-B'); process.exit(2); } range = [+m[1], +m[2]]; argv.splice(pi, 2); }
const [key, ...rest] = argv;
if (!key || !rest.length) { console.error('usage: getsrc.mjs <key> <url> [<url>...] [--pages A-B] | <key> --file <path> [--pages A-B]'); process.exit(2); }
const UA = 'synapse-reef-paper-check/1.0 (reading cited sources for a research paper)';
const WALL = /verify (that )?you are (not a bot|human)|captcha|cf-chl|just a moment|client challenge|enable javascript|checking your browser|access denied|are you a robot|sign in to (continue|read|access)|log ?in to (continue|access)|purchase (this )?article|buy (this )?article|institutional access|get access|rent this article|subscribe to (read|access)|request access/i;

// printed page numbers: a page's first or last short line that is a number (alone, or beside a running head); kept only where the
// offset (printed − index) agrees with a neighbouring page's
const printedOf = pages => {
  const cand = pages.map(p => { const ls = p.split('\n').map(s => s.trim()).filter(Boolean); const ends = [...ls.slice(0, 3), ...ls.slice(-3)];
    for (const l of ends) { const m = /^(\d{1,4})$/.exec(l) || /^(\d{1,4})\s{2,}\S.{0,80}$/.exec(l) || /^\S.{0,80}\s{2,}(\d{1,4})$/.exec(l); if (m) return +m[1]; } return null; });
  return cand.map((v, i) => { if (v == null) return null; const off = v - (i + 1), nb = [cand[i - 1], cand[i + 1]].map((w, j) => w == null ? null : w - (i + (j ? 2 : 0)));
    return nb.some(o => o === off) ? v : null; });
};
const pdfText = (file, mode) => {
  const a = [mode, '-enc', 'UTF-8']; if (range) a.push('-f', String(range[0]), '-l', String(range[1]));
  const raw = execFileSync('pdftotext', [...a, file, '-'], { maxBuffer: 1024 * 1024 * 1024 }).toString('utf8');
  const pages = raw.split('\f'); if (pages.length && !pages[pages.length - 1].trim()) pages.pop();
  return pages;
};
const toText = (file, kind) => {
  if (kind === 'pdf') {
    const lay = pdfText(file, '-layout'), raw = pdfText(file, '-raw'), off = range ? range[0] - 1 : 0, pr = printedOf(raw);
    try {   // the PDF's own page labels, where it has them ("…, Pg 1524" → 1524), win over the guess from the text
      const lab = JSON.parse(execFileSync('py', ['-3.13', path.join(ROOT, 'tools/paper-v2/pdflabels.py'), file]).toString());
      for (let i = 0; i < pr.length; i++) { const m = /(\d{1,5})\s*$/.exec(lab[i + off] || ''); if (m && lab[i + off] !== String(i + 1 + off)) pr[i] = +m[1]; }
    } catch { /* no PyMuPDF: keep the guess */ }
    const head = i => `=== p. ${i + 1 + off}${pr[i] != null && pr[i] !== i + 1 + off ? ` (printed ${pr[i]})` : ''} ===`;
    return { text: lay.map((p, i) => `${head(i)}\n${p}`).join('\n'), raw: raw.map((p, i) => `${head(i)}\n${p}`).join('\n'), pages: lay.length,
      chars: lay.join('').replace(/\s+/g, '').length };
  }
  const html = fs.readFileSync(file, 'utf8');
  const t = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<\/(p|div|h\d|li|tr|br|table|section)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/t[dh]>/gi, ' | ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n\n');
  const text = `=== p. 1 === (web page: one "page")\n${t}`;
  return { text, raw: text, pages: 1, chars: t.replace(/\s+/g, '').length };
};
// a candidate passes if it has a text layer of some length and is not a wall
const judge = (file, kind) => {
  const r = toText(file, kind);
  const scanned = kind === 'pdf' && r.pages > 0 && r.chars / r.pages < 200;
  const wall = kind === 'html' && WALL.test(r.text.slice(0, 30000)) && r.chars < 20000;
  const short = r.chars < 1500 && !scanned;
  return { ...r, scanned, wall, short, ok: !wall && !short && !scanned };
};
const keep = (tmp, kind, r, url, tried) => {
  const file = path.join(DIR, `${key}.${kind}`); fs.renameSync(tmp, file);
  for (const k of ['pdf', 'html']) if (k !== kind) { const o = path.join(DIR, `${key}.${k}`); if (fs.existsSync(o)) fs.unlinkSync(o); }
  fs.writeFileSync(path.join(DIR, `${key}.txt`), r.text); fs.writeFileSync(path.join(DIR, `${key}.raw.txt`), r.raw);
  console.log(JSON.stringify({ key, ok: r.ok, file: path.relative(ROOT, file), txt: path.relative(ROOT, path.join(DIR, `${key}.txt`)), raw: path.relative(ROOT, path.join(DIR, `${key}.raw.txt`)),
    kind, pages: r.pages, range, chars: r.chars, scanned: r.scanned, url, tried }));
};

const tried = [];
if (rest[0] === '--file') {
  const src = path.resolve(rest[1]); const kind = /\.pdf$/i.test(src) ? 'pdf' : 'html';
  const tmp = path.join(DIR, `${key}.tmp.${kind}`); fs.copyFileSync(src, tmp);
  keep(tmp, kind, judge(tmp, kind), 'file:' + rest[1], tried); process.exit(0);
}
let best = null;   // a scanned PDF is kept only if nothing better turns up
for (const url of rest) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/pdf,text/html;q=0.9,*/*;q=0.5' }, redirect: 'follow', signal: AbortSignal.timeout(120000) });
    const ct = r.headers.get('content-type') || '';
    if (!r.ok) { tried.push({ url, status: r.status, note: ct.split(';')[0] }); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    const kind = /pdf/i.test(ct) || buf.slice(0, 5).toString() === '%PDF-' ? 'pdf' : 'html';
    const tmp = path.join(DIR, `${key}.tmp${tried.length}.${kind}`); fs.writeFileSync(tmp, buf);
    let j; try { j = judge(tmp, kind); } catch (e) { tried.push({ url, status: r.status, note: `${kind} could not be read: ${String(e.message).slice(0, 80)}` }); fs.unlinkSync(tmp); continue; }
    if (j.ok) { tried.push({ url, status: r.status, note: `${kind} ${buf.length} bytes, ${j.pages} pages` }); if (best) fs.unlinkSync(best.tmp); keep(tmp, kind, j, r.url || url, tried); process.exit(0); }
    tried.push({ url, status: r.status, note: j.wall ? 'login/paywall/bot-check page (not kept)' : j.scanned ? `scanned PDF, no text layer (${j.pages} pages)` : `too short to be the text (${j.chars} chars; not kept)` });
    if (j.scanned && !best) best = { tmp, kind, j, url: r.url || url }; else fs.unlinkSync(tmp);
  } catch (e) { tried.push({ url, status: 'error', note: String(e.cause?.code || e.message || e).slice(0, 120) }); }
}
if (best) { keep(best.tmp, best.kind, best.j, best.url, tried); process.exit(0); }   // ok:false, scanned:true — read its page images
console.log(JSON.stringify({ key, ok: false, tried }));
