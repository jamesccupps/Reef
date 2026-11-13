#!/usr/bin/env node
// The working paper on the web: builds docs/paper/*.md into paper/, one page per part, which GitHub Pages serves at
// https://jamesccupps.github.io/Reef/paper/ so search engines can find and index it (a Markdown file on GitHub mostly
// isn't). No dependencies: a converter for the Markdown the paper uses (ATX headings, paragraphs, bullet and numbered
// lists, GitHub tables, emphasis, code, links, bare URLs, one figure, rules), giving headings GitHub's ids so the parts'
// cross-links keep working. The <!-- src: ... --> notes are left out of the pages. Every internal link must land on a
// page and a heading, or the build stops.
//
//   node tools/paper-site.mjs           write paper/ (after any change to docs/paper/*.md)
//   node tools/paper-site.mjs --check   exit 1 if paper/ isn't what docs/paper/ builds (npm run test:2d runs this)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = 'docs/paper';
const OUT = 'paper';
const SITE = 'https://jamesccupps.github.io/Reef/';
const BASE = SITE + OUT + '/';
const REPO = 'https://github.com/jamesccupps/Reef/';
const AUTHOR = { '@type': 'Person', name: 'James Cupps', url: 'https://jamesccupps.github.io/' };
const IMAGE = { url: SITE + 'docs/images/social-card.png', width: 1280, height: 640,
                alt: 'The lake in its first spring: hundreds of fish of eight species, the water column, and the environment panel' };

// What a search result shows for each page (the paper's own first lines don't make a 160-character summary)
const DESCRIPTIONS = {
  '': 'A synthesis of what is known about small, shallow Maine lakes, and what building a whole-lake fish simulation ' +
      'of the Hot Brook lakes taught. A working paper.',
  'introduction-and-study-system': 'Introduction and study system: Upper and Lower Hot Brook Lake in eastern Maine, ' +
      'their catchment, and the little that has been measured there.',
  'synthesis-physical-to-plants': 'Small Maine lakes from the bottom up: climate, ice and lake physics, nutrients and ' +
      'shores, plankton and the microbial loop, and aquatic plants.',
  'synthesis-fish-to-forest': 'The fish of small Maine lakes: life histories, energetics, early life and recruitment, ' +
      'predation and the food web, and the wildlife and forest around them.',
  'model-and-lessons': 'A whole-lake simulation with neural-network fish and Fish Bioenergetics 4.0, and what building ' +
      'and testing it taught about modeling a lake.',
  'discussion': 'What is known about small Maine lakes, what is not, and the measurements that would most reduce the ' +
      'uncertainty; data, code and the use of AI.',
  'references': 'References for the Hot Brook lakes working paper: limnology, fisheries and ecology of Maine and ' +
      'comparable northern lakes.',
};

// ── text helpers ────────────────────────────────────────────────────────────────────────────────────────────────────
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const textOf = (html) => unesc(html.replace(/<[^>]+>/g, ''));
const leading = (l) => l.length - l.trimStart().length;

// GitHub's heading ids (github-slugger): lower case, punctuation and symbols dropped, spaces to hyphens, repeats -1, -2
function slugger() {
  const seen = new Map();
  return (text) => {
    const base = text.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, '').replace(/ /g, '-');
    let id = base;
    while (seen.has(id)) {
      seen.set(base, seen.get(base) + 1);
      id = base + '-' + seen.get(base);
    }
    seen.set(id, 0);
    return id;
  };
}

// ── inline Markdown ─────────────────────────────────────────────────────────────────────────────────────────────────
// Emphasis by CommonMark's delimiter rules (what GitHub follows), so "0.98*r*" and a species name in italics inside an
// italic title come out as on GitHub. Single tildes stay text: GitHub strikes through between any two, which turns
// "~45 % … (±~8 points)" into a crossed-out passage.
const WS = /\s/;
const PUNCT = /[\p{P}\p{S}]/u;
function emphasis(h) {
  const parts = [];
  const re = /\*+|_+/g;
  let last = 0;
  let m;
  while ((m = re.exec(h))) {
    if (m.index > last) parts.push(h.slice(last, m.index));
    const prev = h[m.index - 1] ?? ' ';
    const next = h[re.lastIndex] ?? ' ';
    const lf = !WS.test(next) && (!PUNCT.test(next) || WS.test(prev) || PUNCT.test(prev));
    const rf = !WS.test(prev) && (!PUNCT.test(prev) || WS.test(next) || PUNCT.test(next));
    const ch = m[0][0];
    parts.push({
      ch, n: m[0].length, orig: m[0].length, open: [], close: [], active: true,
      canOpen: ch === '*' ? lf : lf && (!rf || PUNCT.test(prev)),
      canClose: ch === '*' ? rf : rf && (!lf || PUNCT.test(next)),
    });
    last = re.lastIndex;
  }
  if (last < h.length) parts.push(h.slice(last));
  const runs = parts.filter((p) => typeof p === 'object');
  for (let ci = 0; ci < runs.length; ci++) {
    const c = runs[ci];
    while (c.canClose && c.active && c.n > 0) {
      let oi = -1;
      for (let k = ci - 1; k >= 0; k--) {
        const o = runs[k];
        if (!o.active || !o.n || o.ch !== c.ch || !o.canOpen) continue;
        if ((o.canClose || c.canOpen) && (o.orig + c.orig) % 3 === 0 && !(o.orig % 3 === 0 && c.orig % 3 === 0)) continue;
        oi = k;
        break;
      }
      if (oi < 0) break;
      const o = runs[oi];
      const use = o.n >= 2 && c.n >= 2 ? 2 : 1;
      const tag = use === 2 ? 'strong' : 'em';
      o.n -= use;
      c.n -= use;
      o.open.unshift(`<${tag}>`);
      c.close.push(`</${tag}>`);
      for (let k = oi + 1; k < ci; k++) runs[k].active = false;
    }
  }
  return parts.map((p) => (typeof p === 'string' ? p : p.close.join('') + p.ch.repeat(p.n) + p.open.join(''))).join('')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>');
}

function inline(src, page) {
  const stash = [];
  const put = (html) => `\u0000${stash.push(html) - 1}\u0001`;
  const text = (raw) => emphasis(esc(raw));
  let s = src;
  s = s.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (m, ticks, code) =>
    put(`<code>${esc(code.replace(/\n/g, ' ').replace(/^ ([\s\S]*) $/, '$1'))}</code>`));
  s = s.replace(/\\([!-/:-@[-`{-~])/g, (m, c) => put(esc(c)));
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) =>
    put(`<img src="${esc(page.asset(url))}" alt="${esc(alt)}">`));
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => put(`<a href="${esc(page.href(url))}">${text(label)}</a>`));
  s = s.replace(/<(https?:\/\/[^\s>]+)>/g, (m, url) => put(`<a href="${esc(url)}">${esc(url)}</a>`));
  // "commit cf70977": GitHub links a commit named in the repository's own pages
  s = s.replace(/\b(commits? )([0-9a-f]{7,40})\b/g, (m, word, sha) => word + put(`<a href="${REPO}commit/${sha}"><code>${sha}</code></a>`));
  // bare URLs (GitHub links them too), without the punctuation that ends a sentence or closes a bracket
  s = s.replace(/(^|[\s(;])(https?:\/\/[^\s<\u0000\u0001]+)/g, (m, pre, url) => {
    let tail = '';
    for (;;) {
      if (/[.,:;!?"'*_~]$/.test(url)) { tail = url.slice(-1) + tail; url = url.slice(0, -1); continue; }
      if (url.endsWith(')') && (url.match(/\(/g) || []).length < (url.match(/\)/g) || []).length) {
        tail = ')' + tail; url = url.slice(0, -1); continue;
      }
      break;
    }
    return pre + put(`<a href="${esc(url)}">${esc(url)}</a>`) + tail;
  });
  let html = text(s);
  while (/\u0000\d+\u0001/.test(html)) html = html.replace(/\u0000(\d+)\u0001/g, (m, k) => stash[+k]);
  return html;
}

// ── block Markdown ──────────────────────────────────────────────────────────────────────────────────────────────────
const BLANK = /^\s*$/;
const HEADING = /^ {0,3}(#{1,6})[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$/;
const RULE = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const ITEM = /^( *)([-*+]|\d{1,9}[.)])( +)(\S.*)$/;
const FENCE = /^ {0,3}(`{3,}|~{3,})/;
const DELIM = /^ *\|? *:?-+:? *(\| *:?-+:? *)*\|? *$/;

function cells(row) {
  const out = [];
  let cur = '';
  let code = false;
  const r = row.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '');
  for (let k = 0; k < r.length; k++) {
    const c = r[k];
    if (c === '\\' && r[k + 1] === '|') { cur += '|'; k++; continue; }
    if (c === '`') code = !code;
    if (c === '|' && !code) { out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function blocks(lines, page, tight = false) {
  const out = [];
  const isTable = (k) => k + 1 < lines.length && lines[k].includes('|') && DELIM.test(lines[k + 1]) && lines[k + 1].includes('-');
  const interrupts = (k) => {
    const l = lines[k];
    const m = ITEM.exec(l);
    return BLANK.test(l) || HEADING.test(l) || RULE.test(l) || FENCE.test(l) || isTable(k) || /^ {0,3}>/.test(l) ||
      (m && (!/\d/.test(m[2]) || parseInt(m[2], 10) === 1));
  };
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    let m;
    if (BLANK.test(l)) { i++; continue; }
    if ((m = FENCE.exec(l))) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith(m[1])) code.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
      continue;
    }
    if ((m = HEADING.exec(l))) { out.push(page.heading(m[1].length, m[2])); i++; continue; }
    if (RULE.test(l)) { out.push('<hr>'); i++; continue; }
    if (isTable(i)) {
      const head = cells(lines[i]);
      const align = cells(lines[i + 1]).map((c) => (c.startsWith(':') && c.endsWith(':') ? 'c' : c.endsWith(':') ? 'r' : c.startsWith(':') ? 'l' : ''));
      const cell = (tag, c, k) => `<${tag}${align[k] ? ` class="al-${align[k]}"` : ''}>${inline(c, page)}</${tag}>`;
      const rows = [];
      i += 2;
      while (i < lines.length && !BLANK.test(lines[i]) && lines[i].includes('|')) {
        const r = cells(lines[i++]);
        rows.push('<tr>' + head.map((h, k) => cell('td', r[k] ?? '', k)).join('') + '</tr>');
      }
      out.push('<div class="table-wrap"><table>\n<thead><tr>' + head.map((h, k) => cell('th', h, k)).join('') +
        '</tr></thead>\n<tbody>\n' + rows.join('\n') + '\n</tbody></table></div>');
      continue;
    }
    if (ITEM.test(l)) { const [html, next] = list(lines, i, page); out.push(html); i = next; continue; }
    if (/^ {0,3}>/.test(l)) {
      const quote = [];
      while (i < lines.length && !BLANK.test(lines[i])) quote.push(lines[i++].replace(/^ {0,3}> ?/, ''));
      out.push(`<blockquote>\n${blocks(quote, page)}\n</blockquote>`);
      continue;
    }
    const para = [l.trim()];
    i++;
    while (i < lines.length && !interrupts(i)) para.push(lines[i++].trim());
    out.push(page.paragraph(para.join('\n'), tight));
  }
  return out.join('\n');
}

function list(lines, start, page) {
  const first = ITEM.exec(lines[start]);
  const indent = first[1].length;
  const ordered = /\d/.test(first[2]);
  const items = [];
  let loose = false;
  let i = start;
  while (i < lines.length) {
    const m = ITEM.exec(lines[i]);
    if (!m || m[1].length !== indent || /\d/.test(m[2]) !== ordered) break;
    const inner = m[1].length + m[2].length + m[3].length;
    const body = [m[4]];
    i++;
    while (i < lines.length) {
      const l = lines[i];
      if (BLANK.test(l)) {
        let k = i;
        while (k < lines.length && BLANK.test(lines[k])) k++;
        if (k < lines.length && leading(lines[k]) >= inner) { body.push(''); i = k; loose = true; continue; }
        break;
      }
      if (leading(l) >= inner) { body.push(l.slice(inner)); i++; continue; }
      if (ITEM.test(l) || HEADING.test(l) || RULE.test(l) || FENCE.test(l)) break;
      body.push(l.trim()); // a lazy continuation of the item's paragraph
      i++;
    }
    items.push(body);
    let k = i;
    while (k < lines.length && BLANK.test(lines[k])) k++;
    if (k === i) continue;
    const n = k < lines.length && ITEM.exec(lines[k]);
    if (n && n[1].length === indent && /\d/.test(n[2]) === ordered) { loose = true; i = k; continue; }
    break;
  }
  const tag = ordered ? 'ol' : 'ul';
  const startAt = ordered && parseInt(first[2], 10) !== 1 ? ` start="${parseInt(first[2], 10)}"` : '';
  return [`<${tag}${startAt}>\n` + items.map((b) => `<li>${blocks(b, page, !loose)}</li>`).join('\n') + `\n</${tag}>`, i];
}

// ── pages ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const read = (f) => fs.readFileSync(path.join(ROOT, SRC, f), 'utf8').replace(/\r\n?/g, '\n');
const stripNotes = (md) => md.replace(/<!--[\s\S]*?-->/g, '');
const slugOf = (file) => file.replace(/^\d+_/, '').replace(/\.md$/, '').replace(/_/g, '-');

function readPaper() {
  const readme = read('README.md');
  const title = readme.match(/^# (.+)$/m)[1].trim();
  const m = readme.match(/version (\d+\.\d+) — (\d{1,2} \w+ \d{4}) \(version 1\.0, (\d{1,2} \w+ \d{4})/);
  if (!m) throw new Error('docs/paper/README.md: no "version X.Y — D Month YYYY (version 1.0, D Month YYYY" line');
  const iso = (d) => new Date(d + ' UTC').toISOString().slice(0, 10);
  const abstract = readme.split(/^## Abstract\s*$/m)[1].split(/^\*\*Keywords:\*\*/m)[0].trim().replace(/\s*\n\s*/g, ' ');
  const keywords = readme.match(/^\*\*Keywords:\*\*([\s\S]*?)\n\n/m)[1].replace(/\s*\n\s*/g, ' ').split(';').map((k) => k.trim());
  const parts = [...readme.matchAll(/^- \*\*\[([^\]]+)\]\(([^)#]+\.md)(?:#[^)]*)?\)\*\*/gm)].map(([, name, file]) => ({
    name, file, slug: slugOf(file),
    short: name.replace(/^Part \d+: /, '').replace(/^Synthesis I+: /, '').replace(/^./, (c) => c.toUpperCase()),
  }));
  return { readme, title, version: m[1], modified: iso(m[2]), published: iso(m[3]), modifiedText: m[2], abstract, keywords, parts };
}

function buildSite() {
  const paper = readPaper();
  const pageOfFile = new Map([['README.md', ''], ...paper.parts.map((p) => [p.file, p.slug])]);
  const ids = new Map();      // page slug -> Set of heading ids
  const links = [];           // [from page, to page, fragment] to check once every page is built
  const files = new Map();
  const bodies = new Map();

  const render = (file, slug) => {
    const dir = slug ? `${OUT}/${slug}` : OUT;
    const slugify = slugger();
    const pageIds = new Set();
    const headings = [];
    const page = {
      href(url) {
        if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
        const [p, frag] = url.split('#');
        if (!p) { links.push([slug, slug, frag]); return '#' + frag; }
        const target = path.posix.normalize(path.posix.join(SRC, p));
        const f = path.posix.relative(SRC, target);
        if (pageOfFile.has(f)) {
          const to = pageOfFile.get(f);
          links.push([slug, to, frag]);
          const rel = path.posix.relative(dir, to ? `${OUT}/${to}` : OUT) || '.';
          return (to === slug ? '' : rel + '/') + (frag ? '#' + frag : '');
        }
        return REPO + (fs.existsSync(path.join(ROOT, target)) && fs.statSync(path.join(ROOT, target)).isDirectory() ? 'tree' : 'blob') +
          '/main/' + target + (frag ? '#' + frag : '');
      },
      asset(url) {
        if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
        const target = path.posix.normalize(path.posix.join(SRC, url));
        if (!fs.existsSync(path.join(ROOT, target))) throw new Error(`${file}: ${url} doesn't exist`);
        return path.posix.relative(dir, target);
      },
      heading(level, md) {
        const html = inline(md, page);
        const id = slugify(textOf(html));
        pageIds.add(id);
        headings.push({ level, id, html });
        return `<h${level} id="${id}">${html}</h${level}>`;
      },
      paragraph(md, tight) {
        const fig = md.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
        if (fig) {
          // (no caption from the alt text: the paper's own "Figure N." paragraph follows the figure)
          return `<figure><img src="${esc(page.asset(fig[2]))}" alt="${esc(fig[1])}"></figure>`;
        }
        const html = inline(md, page);
        if (tight) return html;
        const cls = /\]\(README\.md#contents\)/.test(md) ? ' class="pager"' : /^\*The Hot Brook lakes of eastern Maine\* — /.test(md) ? ' class="kicker"' : '';
        return `<p${cls}>${html}</p>`;
      },
    };
    const body = blocks(stripNotes(read(file)).split('\n'), page);
    ids.set(slug, pageIds);
    bodies.set(file, body);
    return { body, headings, dir };
  };

  const pages = [{ file: 'README.md', slug: '' }, ...paper.parts.map((p) => ({ file: p.file, slug: p.slug, part: p }))];
  const rendered = pages.map((p) => ({ ...p, ...render(p.file, p.slug) }));
  for (const [from, to, frag] of links) {
    if (!ids.has(to)) throw new Error(`link from ${from || 'the contents page'} to a page that isn't built: ${to}`);
    if (frag && !ids.get(to).has(frag)) throw new Error(`link from ${from || 'the contents page'} to ${to || 'the contents page'}#${frag}: no such heading`);
  }
  for (const p of rendered) files.set(p.dir + '/index.html', html(paper, p, rendered));
  files.set(`${OUT}/paper.css`, CSS);
  return { files, bodies, paper };
}

function html(paper, p, all) {
  const url = BASE + (p.slug ? p.slug + '/' : '');
  const up = p.slug ? '../' : '';
  const isIndex = !p.slug;
  const title = isIndex ? 'The Hot Brook Lakes of Eastern Maine: A Working Paper' : `${p.part.short} | Hot Brook lakes paper`;
  const desc = DESCRIPTIONS[p.slug];
  if (!desc) throw new Error(`no description for the page ${p.slug}: add one to DESCRIPTIONS`);
  const headline = paper.title.split(':')[0];
  const article = {
    '@type': 'ScholarlyArticle', '@id': BASE + '#paper', name: paper.title, headline, author: AUTHOR,
    datePublished: paper.published, dateModified: paper.modified, version: paper.version,
    creativeWorkStatus: 'Working paper (not peer reviewed)', inLanguage: 'en-US', isAccessibleForFree: true,
    url: BASE, mainEntityOfPage: BASE, image: IMAGE.url, abstract: textOf(inline(paper.abstract, { href: (u) => u, asset: (u) => u })),
    keywords: paper.keywords.join(', '),
    hasPart: all.filter((q) => q.slug).map((q) => ({ '@type': 'WebPage', name: q.part.name, url: BASE + q.slug + '/' })),
  };
  const graph = isIndex ? [article] : [{
    '@type': 'WebPage', name: p.part.name, url, inLanguage: 'en-US', author: AUTHOR, dateModified: paper.modified,
    isPartOf: { '@id': BASE + '#paper' },
  }];
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replace(/</g, '\\u003c');
  const scholar = isIndex ? [
    ['citation_title', paper.title], ['citation_author', 'Cupps, James'],
    ['citation_publication_date', paper.published.replace(/-/g, '/')], ['citation_online_date', paper.modified.replace(/-/g, '/')],
    ['citation_abstract_html_url', BASE], ['citation_language', 'en'], ['citation_keywords', paper.keywords.join('; ')],
  ].map(([n, c]) => `<meta name="${n}" content="${esc(c)}">`).join('\n') + '\n' : '';
  const toc = !isIndex && p.headings.filter((h) => h.level <= 3).length > 2
    ? `<details class="toc"><summary>On this page</summary>\n<ul>\n${p.headings.filter((h) => h.level <= 3)
        .map((h) => `<li class="toc-${h.level}"><a href="#${h.id}">${h.html.replace(/<\/?a\b[^>]*>/g, '')}</a></li>`).join('\n')}\n</ul></details>\n`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="James Cupps">
<link rel="canonical" href="${url}">
<link rel="stylesheet" href="${up}paper.css">
<meta name="theme-color" content="#f7f5ef" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#14181d" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Synapse Reef">
<meta property="og:title" content="${esc(isIndex ? paper.title : p.part.name + ' — ' + headline)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${IMAGE.url}">
<meta property="og:image:width" content="${IMAGE.width}">
<meta property="og:image:height" content="${IMAGE.height}">
<meta property="og:image:alt" content="${esc(IMAGE.alt)}">
<meta name="twitter:card" content="summary_large_image">
${scholar}<script type="application/ld+json">
${ld}
</script>
</head>
<body>
<header class="site">
<a href="${up}../">Synapse Reef</a> <span aria-hidden="true">›</span> <a href="${up || './'}">${esc(headline)}</a>
</header>
<main>
<article>
${isIndex ? '' : `<h1>${esc(p.part.name)}</h1>\n`}${toc}${p.body}
</article>
</main>
<footer>
<p>Cupps, J. 2026. <cite>${esc(paper.title)}.</cite> Working paper, version ${paper.version}, ${paper.modifiedText}. Not peer reviewed.</p>
<p><a href="${REPO}tree/main/${SRC}">The paper's source on GitHub</a> · <a href="${up}../">The simulation: Synapse Reef</a> · <a href="https://jamesccupps.github.io/">James Cupps</a></p>
</footer>
</body>
</html>
`;
}

const CSS = `/* The working paper's pages (built by tools/paper-site.mjs; edit it there) */
:root {
  color-scheme: light dark;
  --bg: #f7f5ef; --fg: #1d2126; --muted: #5b6470; --rule: #d9d4c7; --link: #0b5d8f; --code: #ece8de;
  --head: #e9e4d6; --stripe: #efebe1;
}
@media (prefers-color-scheme: dark) {
  :root { --bg: #14181d; --fg: #dfe3e8; --muted: #98a2ae; --rule: #2e353e; --link: #7cc4f0; --code: #222830;
          --head: #232a33; --stripe: #1a1f25; }
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--bg); color: var(--fg);
  font: 1.0625rem/1.65 Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif; }
header.site, main, footer { max-width: 46rem; margin: 0 auto; padding: 0 1rem; }
header.site { padding-top: 1.25rem; font: 0.9rem/1.4 system-ui, -apple-system, "Segoe UI", sans-serif; color: var(--muted); }
header.site a { color: var(--muted); }
h1, h2, h3, h4, h5, h6 { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; line-height: 1.25; margin: 2em 0 0.6em; }
h1 { font-size: 1.85rem; margin-top: 1em; }
h2 { font-size: 1.45rem; border-bottom: 1px solid var(--rule); padding-bottom: 0.25em; }
h3 { font-size: 1.2rem; }
h4 { font-size: 1.05rem; }
a { color: var(--link); text-underline-offset: 0.15em; }
p, ul, ol, figure, .table-wrap, details { margin: 0 0 1em; }
li { margin: 0.2em 0; }
code { font: 0.88em/1.4 ui-monospace, Consolas, "Cascadia Mono", monospace; background: var(--code); padding: 0.05em 0.3em; border-radius: 3px; }
pre code { display: block; padding: 0.75em; overflow-x: auto; }
hr { border: 0; border-top: 1px solid var(--rule); margin: 2em 0; }
.kicker { color: var(--muted); font-style: italic; margin-bottom: 0.3em; }
.pager { font: 0.92rem/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
.table-wrap { overflow-x: auto; border: 1px solid var(--rule); border-radius: 4px; }
table { border-collapse: collapse; width: 100%; font: 0.86rem/1.45 system-ui, -apple-system, "Segoe UI", sans-serif; }
th, td { text-align: left; vertical-align: top; padding: 0.4em 0.6em; border-bottom: 1px solid var(--rule); }
th { background: var(--head); }
tbody tr:nth-child(even) { background: var(--stripe); }
.al-r { text-align: right; } .al-c { text-align: center; } .al-l { text-align: left; }
figure { text-align: center; }
figure img { max-width: 100%; height: auto; max-height: 80vh; }
details.toc { border: 1px solid var(--rule); border-radius: 4px; padding: 0.5em 0.9em; font: 0.92rem/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
details.toc summary { cursor: pointer; font-weight: 600; }
details.toc ul { list-style: none; padding-left: 0; margin: 0.5em 0 0; }
.toc-3 { padding-left: 1.2em; }
footer { border-top: 1px solid var(--rule); margin-top: 3em; padding-top: 1em; padding-bottom: 2em; color: var(--muted);
  font: 0.88rem/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
footer a { color: var(--muted); }
@media print { header.site, details.toc, .pager, footer p:last-child { display: none; } body { background: #fff; color: #000; } }
`;

export { buildSite, inline, blocks };

function main() {
  const check = process.argv.includes('--check');
  const { files } = buildSite();
  const outDir = path.join(ROOT, OUT);
  const onDisk = [];
  const walk = (d) => { if (fs.existsSync(d)) for (const e of fs.readdirSync(d, { withFileTypes: true })) e.isDirectory() ? walk(path.join(d, e.name)) : onDisk.push(path.relative(ROOT, path.join(d, e.name)).split(path.sep).join('/')); };
  walk(outDir);
  const stale = onDisk.filter((f) => !files.has(f));
  const changed = [...files].filter(([f, c]) => !fs.existsSync(path.join(ROOT, f)) || fs.readFileSync(path.join(ROOT, f), 'utf8') !== c).map(([f]) => f);
  if (check) {
    if (changed.length || stale.length) {
      console.error(`paper/ isn't what docs/paper/ builds: run node tools/paper-site.mjs\n  out of date: ${changed.join(', ') || '-'}\n  not built from docs/paper: ${stale.join(', ') || '-'}`);
      process.exit(1);
    }
    console.log(`paper/: ${files.size} files, up to date`);
    return;
  }
  for (const f of stale) fs.rmSync(path.join(ROOT, f));
  for (const [f, c] of files) { fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), c); }
  console.log(`paper/: wrote ${files.size} files (${changed.length} changed${stale.length ? `, ${stale.length} removed` : ''})`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
