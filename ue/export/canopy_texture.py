# canopy_texture.py — the forest seen from afar, as a texture for the landscape's material (the trees themselves stream only within
# ~1.2 km of the walker): from Import/canopy.bin (canopy_raw.py) an RGBA PNG over the far grid's extent (x −2880…2440, y −4920…5040,
# row 0 north, 4-m cells): RGB the canopy's summer colour — dark blue-green where conifers, brighter where hardwoods —, A the tree
# cover (0 bare … 255 closed). Halved to 8-m cells (665 × 1245).
#   python -I ue/export/canopy_texture.py G:/HotBrookUE/Import/canopy.bin G:/HotBrookUE/Import/canopy_rgba.png
import sys
import numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
W, H = 1330, 2490
raw = np.fromfile(src, dtype=np.uint8).reshape(4, H, W).astype(np.float32) / 255
cover, con, bare, trust = raw
cov = np.where(trust > 0.05, cover * (1 - bare), 0.6)   # (off the photos: a mixed forest's cover)
conif = np.where(trust > 0.05, con, 0.5)
dark = np.array([0.105, 0.17, 0.11]); light = np.array([0.20, 0.30, 0.14])   # (sRGB: a spruce stand's, a maple stand's, from above)
rgb = dark[None, None, :] * conif[..., None] + light[None, None, :] * (1 - conif[..., None])
img = np.dstack([np.clip(rgb * 255, 0, 255), np.clip(cov * 255, 0, 255)]).astype(np.uint8)
Image.fromarray(img, 'RGBA').resize((W // 2, H // 2), Image.BOX).save(out)
print(out, img.shape)
