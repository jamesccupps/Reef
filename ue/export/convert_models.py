# convert_models.py — the models downloaded from Sketchfab (G:\HotBrookUE\Import\sketchfab\<name>\: glTF, OBJ, .blend, FBX, as each
# creator left them) made uniform for Unreal, in Blender (5.1): each one's meshes joined (posed as saved), laid along its own axes — a
# fish's length on X (head to +X), its back up (+Z); a bird's and a boat's the same — cut to a polygon budget, sized (a fish to 1 m
# long, so the sim's length in cm scales it directly; a loon, a heron, an eagle, a canoe to their real size), set on its centre (a
# fish) or its base (a bird, a boat), and written as one .glb with its textures (G:\HotBrookUE\Import\models\<name>.glb), with three
# views to check its pose by (…\<name>_side.png from its left, _top.png, _front.png from ahead). Each model's turn (which end is the
# head, which side the back) is set in MODELS after a look at the views.
#   "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" -b --disable-autoexec -P ue/export/convert_models.py -- [name …]
# Blender 5 reads no Collada: the loon's .dae was made a .glb first (trimesh + pycollada: commonLoon.glb beside it).
import bpy, glob, math, os, sys
import numpy as np
from mathutils import Matrix, Vector
SRC = 'G:/HotBrookUE/Import/sketchfab'
OUT = 'G:/HotBrookUE/Import/models'

def M(folder, pattern, kind, size, turn=0, flip=False, pca=False, tex=None, tris=None, pre=None, cut=None):
    # size m (a fish: its length; a bird, a boat: its longest); turn about Z (deg) and flip (upside down) after it is laid on its
    # axes; pca: laid by its principal axes (a scan left at a slant) rather than its box; tex: the textures to dress it in when its
    # file names none (base colour, normal, roughness — under the folder); tris: the triangles kept; pre: a turn (axis, deg) first,
    # for a file whose up is not up; cut: the height (its own units, after pre) below which a scan's base is dropped
    return dict(folder=folder, pattern=pattern, kind=kind, size=size, turn=turn, flip=flip, pca=pca, tex=tex, pre=pre, cut=cut,
                tris=tris or {'fish': 12000, 'bird': 24000, 'boat': 30000}[kind])

MODELS = {
    'smallmouth_bass': M('smallmouth-bass', '*.glb', 'fish', 1.0, turn=180),
    'chain_pickerel': M('chain-pickerel', '*.glb', 'fish', 1.0, turn=180),
    'brown_bullhead': M('channel-catfish', '*.glb', 'fish', 1.0, turn=180),
    'blacknose_dace': M('common-dace-leuciscus-leuciscus', '*.glb', 'fish', 1.0, turn=180),
    'yellow_perch': M('european-perch', '*.glb', 'fish', 1.0, turn=180),
    'white_sucker': M('hog-sucker-catostomus-nigrieans', '*.OBJ', 'fish', 1.0, turn=180,
                      tex=('textures/fish2_base_texture.png', 'textures/fish2_normal.png', None)),
    'banded_killifish': M('northern-studfish-fundulus-catenatus', '*.obj', 'fish', 1.0, pca=True),
    'white_perch': M('yellow-bass-morone-mississippiensis', '*.obj', 'fish', 1.0, pca=True, turn=180),
    'pumpkinseed': M('model-38-pumpkinseed-sunfish', '*.blend', 'fish', 1.0, pca=True, turn=180, tex=('textures/Untitled.png', None, None)),
    'common_loon': M('common-loon', 'commonLoon.glb', 'bird', 0.8, turn=135, pre=('X', -90), cut=-0.06),   # (a scan on its stand)
    'great_blue_heron': M('great-blue-heron', 'Pbr/base.obj', 'bird', 1.2, turn=90,
                          tex=('textures/texture_diffuse.png', 'textures/texture_normal.png', 'textures/texture_roughness.png')),
    'bald_eagle': M('bald-eagle-flying-bird-model', '*.fbx', 'bird', 2.0),
    'canoe': M('cruising-canoe', '*.obj', 'boat', 5.0),
}

def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def load(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == '.blend': bpy.ops.wm.open_mainfile(filepath=path)
    elif ext in ('.glb', '.gltf'): bpy.ops.import_scene.gltf(filepath=path)
    elif ext == '.obj': bpy.ops.wm.obj_import(filepath=path)
    elif ext == '.fbx': bpy.ops.import_scene.fbx(filepath=path)

def dress(ob, folder, tex):
    # a material of its own textures (base colour; normal and roughness if it has them), on every face
    base, normal, rough = tex
    mat = bpy.data.materials.new('M_' + ob.name); mat.use_nodes = True
    nt = mat.node_tree; bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    def image(rel, colour):
        n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(os.path.join(SRC, folder, rel))
        if not colour: n.image.colorspace_settings.name = 'Non-Color'
        return n
    nt.links.new(image(base, True).outputs['Color'], bsdf.inputs['Base Color'])
    if normal:
        nm = nt.nodes.new('ShaderNodeNormalMap'); nt.links.new(image(normal, False).outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    if rough: nt.links.new(image(rough, False).outputs['Color'], bsdf.inputs['Roughness'])
    ob.data.materials.clear(); ob.data.materials.append(mat)
    for p in ob.data.polygons: p.material_index = 0

def box(ob):
    vs = np.array([v.co for v in ob.data.vertices]); return Vector(vs.min(0)), Vector(vs.max(0))

def principal(ob):
    # the axes of its surface (faces weighted by their area): the longest spread its length, the least its width
    me = ob.data; me.calc_loop_triangles()
    co = np.array([v.co for v in me.vertices]); tri = np.array([t.vertices for t in me.loop_triangles])
    a, b, c = co[tri[:, 0]], co[tri[:, 1]], co[tri[:, 2]]
    w = np.linalg.norm(np.cross(b - a, c - a), axis=1) / 2; ctr = (a + b + c) / 3
    m = (ctr * w[:, None]).sum(0) / w.sum(); d = ctr - m
    vals, vecs = np.linalg.eigh((d * w[:, None]).T @ d / w.sum())   # (ascending: width, depth, length)
    L, D, Wd = vecs[:, 2], vecs[:, 1], vecs[:, 0]
    if np.linalg.det(np.array([L, Wd, D])) < 0: Wd = -Wd
    return Matrix((L.tolist(), Wd.tolist(), D.tolist())).to_4x4()   # (rows: the new X, Y, Z in the old frame)

def views(name, hi_lo, kind):
    sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.color_type = 'TEXTURE'; sc.display.shading.light = 'STUDIO'
    sc.render.resolution_x, sc.render.resolution_y = 480, 300; sc.render.film_transparent = False
    if sc.world is None: sc.world = bpy.data.worlds.new('w')
    lo, hi = hi_lo; e = hi - lo; c = (lo + hi) / 2
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
    for tag, loc, rot, span in (('side', (c.x, -10, c.z), (math.pi / 2, 0, 0), max(e.x, e.z)),
                                ('top', (c.x, c.y, 10), (0, 0, 0), max(e.x, e.y)),
                                ('front', (10, c.y, c.z), (math.pi / 2, 0, math.pi / 2), max(e.y, e.z))):
        co.location = loc; co.rotation_euler = rot; cam.ortho_scale = span * 1.3
        sc.render.filepath = os.path.join(OUT, '%s_%s.png' % (name, tag)); bpy.ops.render.render(write_still=True)

def convert(name, s):
    files = sorted(glob.glob(os.path.join(SRC, s['folder'], '**', s['pattern']), recursive=True))
    if not files: print('HB convert %s: no %s in %s' % (name, s['pattern'], s['folder'])); return
    clear(); load(files[0])
    if bpy.context.object and bpy.context.object.mode != 'OBJECT': bpy.ops.object.mode_set(mode='OBJECT')   # (a .blend saved posing)
    for o in list(bpy.context.scene.objects): o.hide_set(False); o.hide_viewport = False
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH' and not o.hide_render]
    if not meshes: print('HB convert %s: no meshes' % name); return
    # (each mesh as it stands — posed by its armature, its modifiers applied — then the rest dropped and the meshes joined into one)
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes: o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.convert(target='MESH')
    meshes = [o for o in bpy.context.selected_objects if o.type == 'MESH']
    for o in meshes: mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
    for o in list(bpy.context.scene.objects):
        if o not in meshes: bpy.data.objects.remove(o, do_unlink=True)
    bpy.ops.object.select_all(action='SELECT'); bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1: bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    # (where it stands — its delta transforms too, which applying its transform leaves — put into its vertices)
    ob.data.transform(ob.matrix_world); ob.delta_location = (0, 0, 0); ob.delta_rotation_euler = (0, 0, 0)
    ob.delta_rotation_quaternion = (1, 0, 0, 0); ob.delta_scale = (1, 1, 1); ob.matrix_world = Matrix.Identity(4)
    ob.animation_data_clear(); ob.constraints.clear()   # (a keyed turn or a constraint would set it again on export)
    if s['pre']: ob.data.transform(Matrix.Rotation(math.radians(s['pre'][1]), 4, s['pre'][0]))
    if s['cut'] is not None:
        import bmesh
        bm = bmesh.new(); bm.from_mesh(ob.data)
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < s['cut']], context='VERTS'); bm.to_mesh(ob.data); bm.free()
    if s['tex']: dress(ob, s['folder'], s['tex'])
    # (the polygon budget: collapsed to it, its UVs kept)
    nt = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    if nt > s['tris']:
        dm = ob.modifiers.new('cut', 'DECIMATE'); dm.ratio = s['tris'] / nt; dm.use_collapse_triangulate = True
        bpy.ops.object.modifier_apply(modifier=dm.name)
    # its own axes: a fish's length along X, its back up Z (its width across Y)
    if s['kind'] == 'fish':
        if s['pca']: ob.data.transform(principal(ob))
        else:
            lo, hi = box(ob); ext = hi - lo; order = sorted(range(3), key=lambda i: -ext[i])
            ax = [Vector([1 if i == k else 0 for i in range(3)]) for k in order]   # (long, depth, width)
            R = Matrix((ax[0], ax[2], ax[1]))
            if R.determinant() < 0: R = Matrix((ax[0], -ax[2], ax[1]))
            ob.data.transform(R.to_4x4())
    ob.data.transform(Matrix.Rotation(math.radians(s['turn']), 4, 'Z'))
    if s['flip']: ob.data.transform(Matrix.Rotation(math.pi, 4, 'X'))
    lo, hi = box(ob); ext = hi - lo; c = (lo + hi) / 2
    k = s['size'] / (ext.x if s['kind'] == 'fish' else max(ext))
    base = Vector((c.x, c.y, c.z if s['kind'] == 'fish' else lo.z))
    ob.data.transform(Matrix.Scale(k, 4) @ Matrix.Translation(-base)); ob.data.update()
    os.makedirs(OUT, exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, name + '.glb'), export_format='GLB', use_selection=True, export_apply=True)
    views(name, box(ob), s['kind'])
    e2 = (hi - lo) * k
    print('HB convert %s: %s -> %d verts %d tris, %.2f x %.2f x %.2f m' % (name, os.path.basename(files[0]), len(ob.data.vertices),
          sum(len(p.vertices) - 2 for p in ob.data.polygons), e2.x, e2.y, e2.z))

names = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
for n, spec in MODELS.items():
    if names and n not in names: continue
    try: convert(n, spec)
    except Exception as ex: print('HB convert %s FAILED: %s' % (n, ex))
