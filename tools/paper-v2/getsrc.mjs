// tools/paper-v2/getsrc.mjs: fetch one source's full text for the v2.0 source pass and make it searchable by page.
//   node tools/paper-v2/getsrc.mjs <key> <url> [<url> ...]   tries each URL in turn until one gives a full text
//   node tools/paper-v2/getsrc.mjs <key> --file <path>        uses a file already on disk (e.g. one the human fetched)
// The file goes to docs/research_notes/fetched/v2/<key>.<pdf|html> (git-ignored: never committed) and its text to <key>.txt, with
// a "=== p. N ===" line before each PDF page (N = the PDF's page index from 1; the printed page number, where different, is the
// reader's to note). It identifies itself honestly and stops at a login, paywall or bot check: it never works around one.
// Prints one JSON line: {key, ok, file, txt, kind, pages, chars, scanned, url, tried:[{url,status,note}]}.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = path.join(ROOT, 'docs/research_notes/fetched/v2');
fs.mkdirSync(DIR, { recursive: true });
const [key, ...rest] = process.argv.slice(2);
if (!key || !rest.length) { console.error('usage: getsrc.mjs <key> <url> [<url>...] | <key> --file <path>'); process.exit(2); }
const UA = 'synapse-reef-paper-check/1.0 (reading cited sources for a research paper)';
const WALL = /verify (that )?you are (not a bot|human)|captcha|cf-chl|access denied|sign in to (continue|read|access)|log ?in to (continue|access)|purchase (this )?article|buy (this )?article|institutional access|get access|rent this article|subscribe to (read|access)/i;

const toText = (file, kind) => {
  if (kind === 'pdf') {
    const raw = execFileSync('pdftotext', ['-layout', '-enc', 'UTF-8', file, '-'], { maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
    const pages = raw.split('\f'); if (pages.length && !pages[pages.length - 1].trim()) pages.pop();
    return { text: pages.map((p, i) => `=== p. ${i + 1} ===\n${p}`).join('\n'), pages: pages.length, chars: raw.replace(/\s+/g, '').length };
  }
  const html = fs.readFileSync(file, 'utf8');
  const t = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<\/(p|div|h\d|li|tr|br|table|section)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n\n');
  return { text: `=== p. 1 === (web page: one "page")\n${t}`, pages: 1, chars: t.replace(/\s+/g, '').length };
};
const finish = (file, kind, url, tried) => {
  const { text, pages, chars } = toText(file, kind);
  const txt = path.join(DIR, `${key}.txt`); fs.writeFileSync(txt, text);
  const scanned = kind === 'pdf' && pages > 0 && chars / pages < 200;
  const wall = kind === 'html' && WALL.test(text.slice(0, 20000)) && chars < 15000;
  console.log(JSON.stringify({ key, ok: !wall && !scanned && chars > 1500, file: path.relative(ROOT, file), txt: path.relative(ROOT, txt), kind, pages, chars, scanned, wall, url, tried }));
};

const tried = [];
if (rest[0] === '--file') {
  const src = path.resolve(rest[1]); const kind = /\.pdf$/i.test(src) ? 'pdf' : 'html';
  const dst = path.join(DIR, `${key}.${kind}`); if (path.resolve(src) !== dst) fs.copyFileSync(src, dst);
  finish(dst, kind, 'file:' + rest[1], tried); process.exit(0);
}
for (const url of rest) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/pdf,text/html;q=0.9,*/*;q=0.5' }, redirect: 'follow' });
    const ct = r.headers.get('content-type') || '';
    if (!r.ok) { tried.push({ url, status: r.status, note: ct }); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    const isPdf = /pdf/i.test(ct) || buf.slice(0, 5).toString() === '%PDF-';
    const kind = isPdf ? 'pdf' : 'html', file = path.join(DIR, `${key}.${kind}`);
    fs.writeFileSync(file, buf);
    if (!isPdf && WALL.test(buf.toString('utf8', 0, Math.min(buf.length, 60000))) && buf.length < 400000) { tried.push({ url, status: r.status, note: 'login/paywall/bot check page' }); continue; }
    tried.push({ url, status: r.status, note: `${kind} ${buf.length} bytes` });
    finish(file, kind, r.url || url, tried); process.exit(0);
  } catch (e) { tried.push({ url, status: 'error', note: String(e.message || e).slice(0, 120) }); }
}
console.log(JSON.stringify({ key, ok: false, tried }));
