# convert_models.py — the models downloaded from Sketchfab (G:\HotBrookUE\Import\sketchfab\<name>\: glTF, OBJ, Collada, .blend, FBX,
# as each creator left them) made uniform for Unreal, in Blender (5.1; no Collada importer since 5.0 — the loon .dae goes through 4.2 or another route): each one's meshes joined, laid along its own axes — a fish's
# length on X (head to +X), its back up (+Z); a bird's and a boat's the same — sized (a fish to 1 m long, so the sim's length in cm
# scales it directly; a loon, a heron, an eagle, a canoe to their real size), set on its centre (a fish) or its base (a bird, a boat),
# and written as one .glb with its textures (G:\HotBrookUE\Import\models\<name>.glb), with a side view to check its pose by
# (…\<name>_side.png). Each model's turn (which end is the head, which side the back) is set in MODELS after a look at the views.
#   "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" -b -P ue/export/convert_models.py -- [name …]
import bpy, glob, math, os, sys
from mathutils import Matrix, Vector
SRC = 'G:/HotBrookUE/Import/sketchfab'
OUT = 'G:/HotBrookUE/Import/models'
# name: (source folder, the file's pattern, kind, size m (fish: length; bird, boat: its longest), turn about Z (deg), flip upside down)
MODELS = {
    'smallmouth_bass': ('smallmouth-bass', '*.glb', 'fish', 1.0, 0, False),
    'chain_pickerel': ('chain-pickerel', '*.glb', 'fish', 1.0, 0, False),
    'brown_bullhead': ('channel-catfish', '*.glb', 'fish', 1.0, 0, False),
    'blacknose_dace': ('common-dace-leuciscus-leuciscus', '*.glb', 'fish', 1.0, 0, False),
    'yellow_perch': ('european-perch', '*.glb', 'fish', 1.0, 0, False),
    'white_sucker': ('hog-sucker-catostomus-nigrieans', '*.OBJ', 'fish', 1.0, 0, False),
    'banded_killifish': ('northern-studfish-fundulus-catenatus', '*.obj', 'fish', 1.0, 0, False),
    'white_perch': ('yellow-bass-morone-mississippiensis', '*.obj', 'fish', 1.0, 0, False),
    'pumpkinseed': ('model-38-pumpkinseed-sunfish', '*.blend', 'fish', 1.0, 0, False),
    'common_loon': ('common-loon', '*.dae', 'bird', 0.8, 0, False),
    'great_blue_heron': ('great-blue-heron', 'Pbr/*.obj', 'bird', 1.2, 0, False),
    'bald_eagle': ('bald-eagle-flying-bird-model', '*.fbx', 'bird', 2.0, 0, False),
    'canoe': ('cruising-canoe', '*.obj', 'boat', 5.0, 0, False),
}

def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def load(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == '.blend': bpy.ops.wm.open_mainfile(filepath=path)
    elif ext in ('.glb', '.gltf'): bpy.ops.import_scene.gltf(filepath=path)
    elif ext == '.obj': bpy.ops.wm.obj_import(filepath=path)
    elif ext == '.dae': bpy.ops.wm.collada_import(filepath=path)
    elif ext == '.fbx': bpy.ops.import_scene.fbx(filepath=path)

def convert(name, spec):
    folder, pattern, kind, size, turn, flip = spec
    files = sorted(glob.glob(os.path.join(SRC, folder, '**', pattern), recursive=True))
    if not files: print('HB convert %s: no %s in %s' % (name, pattern, folder)); return
    clear(); load(files[0])
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    if not meshes: print('HB convert %s: no meshes' % name); return
    # (armatures and empties dropped: the meshes kept where they stand, joined into one)
    for o in meshes:
        o.select_set(True); bpy.context.view_layer.objects.active = o
        mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
    for o in list(bpy.context.scene.objects):
        if o.type != 'MESH': bpy.data.objects.remove(o, do_unlink=True)
    for o in meshes:
        for m in [m for m in o.modifiers if m.type == 'ARMATURE']: o.modifiers.remove(m)
    bpy.ops.object.select_all(action='SELECT'); bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1: bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    # its own axes: the longest along X, the next up (a fish's depth; a bird's height, a boat's beam … its depth for a fish only)
    vs = [v.co for v in ob.data.vertices]
    lo = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs))); hi = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
    ext = hi - lo; order = sorted(range(3), key=lambda i: -ext[i])
    if kind == 'fish':
        ax = [Vector([1 if i == k else 0 for i in range(3)]) for k in order]   # (long, depth, width)
        R = Matrix((ax[0], ax[2], ax[1])).to_4x4()   # (rows: the new X, Y, Z in the old frame)
        if R.to_3x3().determinant() < 0: R = Matrix((ax[0], -ax[2], ax[1])).to_4x4()
        ob.data.transform(R)
    ob.data.transform(Matrix.Rotation(math.radians(turn), 4, 'Z'))
    if flip: ob.data.transform(Matrix.Rotation(math.pi, 4, 'X'))
    vs = [v.co for v in ob.data.vertices]
    lo = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs))); hi = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
    ext = hi - lo; c = (lo + hi) / 2
    s = size / (ext.x if kind == 'fish' else max(ext))
    base = Vector((c.x, c.y, c.z if kind == 'fish' else lo.z))
    ob.data.transform(Matrix.Scale(s, 4) @ Matrix.Translation(-base))
    ob.data.update()
    os.makedirs(OUT, exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, name + '.glb'), export_format='GLB', use_selection=True, export_apply=True)
    # the side view (from -Y, looking at +Y: head right if it faces +X), the textures shown
    sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.color_type = 'TEXTURE'; sc.display.shading.light = 'STUDIO'
    sc.render.resolution_x, sc.render.resolution_y = 640, 360; sc.render.film_transparent = False
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; e2 = (hi - lo) * s; cam.ortho_scale = max(e2.x, e2.z) * 1.3
    co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
    zc = 0 if kind == 'fish' else e2.z / 2
    co.location = (0, -10, zc); co.rotation_euler = (math.pi / 2, 0, 0)
    sc.render.filepath = os.path.join(OUT, name + '_side.png'); bpy.ops.render.render(write_still=True)
    print('HB convert %s: %s -> %d verts, %.2f x %.2f x %.2f m' % (name, os.path.basename(files[0]), len(ob.data.vertices), e2.x, e2.y, e2.z))

names = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
for n, spec in MODELS.items():
    if names and n not in names: continue
    try: convert(n, spec)
    except Exception as ex: print('HB convert %s FAILED: %s' % (n, ex))
