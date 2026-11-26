# tools/paper-v2/pdfpage.py: render one page of a fetched PDF to a PNG, so a reader can look at a table or a scanned page.
#   py -3.13 tools/paper-v2/pdfpage.py <key> <page> [--dpi 130] [--clip x0,y0,x1,y1]   (page = the PDF's index from 1; clip in
#   fractions of the page, e.g. 0,0.5,1,1 for the lower half)
# Writes docs/research_notes/fetched/v2/<key>.p<page>.png and prints its path and the PDF's own page label, if it has one.
# Needs PyMuPDF (py -3.13 -m pip install --user pymupdf).
import sys, os, pymupdf

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
d = os.path.join(root, 'docs', 'research_notes', 'fetched', 'v2')
args = sys.argv[1:]
if len(args) < 2:
    sys.exit('usage: pdfpage.py <key> <page> [--dpi N] [--clip x0,y0,x1,y1]')
key, page = args[0], int(args[1])
dpi = int(args[args.index('--dpi') + 1]) if '--dpi' in args else 130
pdf = os.path.join(d, key + '.pdf')
if not os.path.exists(pdf):
    sys.exit('no ' + pdf)
doc = pymupdf.open(pdf)
if not 1 <= page <= doc.page_count:
    sys.exit(f'page {page} outside 1..{doc.page_count}')
p = doc[page - 1]
clip = None
if '--clip' in args:
    x0, y0, x1, y1 = [float(v) for v in args[args.index('--clip') + 1].split(',')]
    r = p.rect
    clip = pymupdf.Rect(r.x0 + x0 * r.width, r.y0 + y0 * r.height, r.x0 + x1 * r.width, r.y0 + y1 * r.height)
out = os.path.join(d, f'{key}.p{page}.png')
p.get_pixmap(dpi=dpi, clip=clip).save(out)
label = p.get_label() if hasattr(p, 'get_label') else ''
print(os.path.relpath(out, root).replace('\\', '/') + (f'   (the PDF labels this page "{label}")' if label else ''))
