# canopy_raw.py — the aerial photos' forest (src/w3/true/canopy3.jpg: four 1330x2490 panels side by side — tree cover, conifer share,
# bare ground, trust — 4-m cells over the far grid's extent, row 0 north; tools/hotbrook/build_canopy3.py) decoded to raw bytes for
# the forest exporter: Import/canopy.bin = the four planes one after another (uint8, W*H each).
#   python -I ue/export/canopy_raw.py <canopy3.jpg> <out canopy.bin>
import sys
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('L'); W4, H = im.size; W = W4 // 4
with open(out, 'wb') as f:
    for k in range(4): f.write(im.crop((k * W, 0, (k + 1) * W, H)).tobytes())
print(W, H)
