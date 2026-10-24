# recolor_animals.py — the bear and moose models the human downloaded, recoloured for Maine's:
#   - the bear is coloured as a grizzly (blond-brown); Maine's bears are American black bears: a glossy black coat, a tan-brown
#     muzzle (MDIFW; Pelton 2003 — brown and cinnamon phases are western, all but absent in the Northeast). Its two fur maps are
#     repainted so: each pixel's brightness relative to the map's (the fur's detail kept) laid on a black coat's colour, the muzzle
#     (about the nose on the head map) on a tan; the nose, the eye, the lips and tongue (pink) left as they are;
#   - the moose's coat is a mid grey-brown; a moose is dark brown to near black, its lower legs grey-white (Franzmann 1981, Mammalian
#     Species 154): the map darkened (×0.6 in sRGB — the body to ~55, the pale legs still pale against it).
# The repainted maps go to G:\HotBrookUE\Import\animals_recolor\ under the same names; Scripts/import_animals.py imports them over
# the originals. (The models' files stay on G: and out of the repository.)
#   python -I ue/export/recolor_animals.py   (needs Pillow and numpy)
import glob, os, sys
import numpy as np
from PIL import Image
SRC = 'G:/HotBrookUE/Import/sketchfab/realistic-animated-bear-3d-model/textures'
MOOSE = 'G:/HotBrookUE/Import/sketchfab/moose-realistic-3d-model-demo-free/textures/T_AlcesAmericanus_M_BC.png'
OUT = 'G:/HotBrookUE/Import/animals_recolor'
COAT = np.array([26, 23, 21], float)     # (sRGB: a black bear's coat in daylight — near black, a little warm)
MUZZLE = np.array([122, 92, 62], float)  # (its tan-brown muzzle)

def recolor(path, muzzle):
    im = np.asarray(Image.open(path).convert('RGB')).astype(float)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    fur = lum > 8   # (the map's empty space stays as it is)
    rel = np.clip(lum / max(1.0, np.median(lum[fur])), 0.25, 2.2)[..., None]
    out = np.clip(rel * COAT, 0, 255)
    H, W = lum.shape; yy, xx = np.mgrid[0:H, 0:W] / np.array([H, W])[:, None, None]
    if muzzle:   # (about the nose: the head map's lower left — a soft-edged ellipse)
        d = ((xx - 0.13) / 0.16) ** 2 + ((yy - 0.62) / 0.15) ** 2
        w = np.clip(1.6 - d, 0, 1)[..., None]
        out = out * (1 - w) + np.clip(rel * MUZZLE, 0, 255) * w
    keep = (r > g * 1.25) & (r > 110) & (b >= g * 0.95)   # (pink lips and tongue: blue as strong as green, unlike the tan fur)
    if muzzle:   # (the nose, already black, and the eye)
        keep |= ((((xx - 0.07) / 0.06) ** 2 + ((yy - 0.56) / 0.06) ** 2) < 1) & (lum < 60)
        keep |= (((xx - 0.40) / 0.035) ** 2 + ((yy - 0.45) / 0.035) ** 2) < 1
    out = np.where((keep | ~fur)[..., None], im, out)
    os.makedirs(OUT, exist_ok=True)
    Image.fromarray(out.astype(np.uint8)).save(os.path.join(OUT, os.path.basename(path)))
    print('recoloured', os.path.basename(path))

for p in sorted(glob.glob(os.path.join(SRC, '*_ab*.png'))):
    if '_head_' in p: recolor(p, True)
    elif '_uppr_' in p: recolor(p, False)

def darken(path, k):
    im = np.asarray(Image.open(path).convert('RGB')).astype(float)
    os.makedirs(OUT, exist_ok=True)
    Image.fromarray(np.clip(im * k, 0, 255).astype(np.uint8)).save(os.path.join(OUT, os.path.basename(path)))
    print('darkened', os.path.basename(path))
if os.path.exists(MOOSE): darken(MOOSE, 0.6)
