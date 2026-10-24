# megascans_surfaces.py — the Megascans ground surfaces for Unreal, from the Fab downloads the Epic launcher keeps
# (C:\ProgramData\Epic\EpicGamesLauncher\VaultCache\FabLibrary\<listing>\texture-set\…: 4K/8K JPEGs) to G:\HotBrookUE\Import\surfaces:
# each surface's base colour, normal, roughness and ambient occlusion at 2048² (the ground tiles them a couple of metres a repeat —
# 8K is far past what the eye resolves at a walker's height). The files stay off the repository (Fab licence).
#   python -I ue/export/megascans_surfaces.py [vault dir] [out dir]
import glob, os, sys
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
# (the launcher's cache was moved to G:\EpicVaultCache, with a junction at its old place on C:)
VAULT = sys.argv[1] if len(sys.argv) > 1 else next((d for d in (r'G:\EpicVaultCache\FabLibrary', r'C:\ProgramData\Epic\EpicGamesLauncher\VaultCache\FabLibrary') if os.path.isdir(d)), '')
OUT = sys.argv[2] if len(sys.argv) > 2 else r'G:\HotBrookUE\Import\surfaces'
# (our name: the listing's folder prefix in the launcher cache)
SURFACES = {'ForestFloorA': 'Forest_Floor-dae56d09', 'ForestFloorB': 'Forest_Floor-db8c5bda', 'Compost': 'Forest_Floor_Compost-',
            'MossyFloor': 'Mossy_Forest_Floor-', 'RockyFloor': 'Rocky_Forest_Floor-', 'Mud': 'Soil_Mud-', 'Gravel': 'Gravel_Ground-',
            'DirtRoad': 'Fine_American_Road-', 'GrassySoil': 'Grassy_Soil-'}
MAPS = ['BaseColor', 'Normal', 'Roughness', 'AO']
os.makedirs(OUT, exist_ok=True)
for name, prefix in SURFACES.items():
    dirs = [d for d in glob.glob(os.path.join(VAULT, prefix + '*', 'texture-set', '*_extracted'))]
    if not dirs: print('missing', name); continue
    for mp in MAPS:
        src = glob.glob(os.path.join(dirs[0], '*_%s.jpg' % mp))
        if not src: print('  no', mp, 'for', name); continue
        dst = os.path.join(OUT, '%s_%s.png' % (name, mp))
        if os.path.exists(dst) and os.path.getmtime(dst) > os.path.getmtime(src[0]): continue
        im = Image.open(src[0]); im = im.convert('RGB' if mp in ('BaseColor', 'Normal') else 'L')
        im.resize((2048, 2048), Image.LANCZOS).save(dst)
    print(name, 'ok')
