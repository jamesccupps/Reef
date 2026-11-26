# tools/paper-v2/pdflabels.py: print a PDF's own page labels as JSON (one per page; "" where it has none) — getsrc.mjs uses them
# for the printed page numbers. Needs PyMuPDF.
import sys, json, pymupdf
doc = pymupdf.open(sys.argv[1])
print(json.dumps([(p.get_label() if hasattr(p, 'get_label') else '') or '' for p in doc]))
