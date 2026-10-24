# convert_creatures.py — the second batch of Sketchfab models (the wanted list of 2026-10-24: G:\HotBrookUE\Import\sketchfab\
# wanted_2026-10-24.md, downloaded by the human) made uniform for Unreal, in Blender (5.1), into G:\HotBrookUE\Import\creatures\:
#   - the ANIMATED ones (the ospreys, kingfishers and the loon in flight and perched — OSU's; the UC Davis bald eagle's flight; the
#     otter's swim; the people): one skinned mesh on one armature with its clips — every part bound to the bone it hangs from (a part
#     parented to a bone, or to nothing, rides that bone, or the root, rigidly), turned to face +X with its back up (+Z) and written
#     as a .glb with its animations; the size is left as the file has it (an armature's scale can't be applied without breaking its
#     clips) — import_creatures.py measures each in Unreal and the game scales it to the animal's real length;
#   - the SCANS (the hooded merganser hen, the ferret that becomes the mink, the snapping and painted turtles, the bullfrog and its
#     tadpole, the rod): joined, cut to a triangle budget (Nanite draws the rest), turned, sized to the animal's real length, set on
#     its base, written as a .glb (the painted turtle's colour is in its vertices: kept as COLOR_0).
# Each one's three views go beside it (…_side.png from its left, _top.png, _front.png from ahead) to check its turn by.
#   "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" -b --disable-autoexec -P ue/export/convert_creatures.py -- [name …]
# The models stay out of the repository (their licences — ue/README.md credits them); this script is ours.
import bpy, glob, math, os, sys
import numpy as np
from mathutils import Matrix, Vector
SRC = 'G:/HotBrookUE/Import/sketchfab'
OUT = 'G:/HotBrookUE/Import/creatures'
DROP = ('Icosphere', 'Cube', 'Light', 'Camera')   # (the OSU files' bounding sphere; the scans' display stands, lamps and cameras)

def C(folder, pattern, kind, size=None, turn=0, pre=None, tris=None, tex=None, drop=DROP, cutf=None, axis='long', recolor=None, pca=False, flip=False):
    # kind: 'skinned' (an armature and its clips; size None — scaled in the game) or 'static' (a scan: size m, its longest — or its
    # length along X when axis is 'x'); turn about Z (deg) after laid on its axes; pre: (axis, deg) first, for a file whose up is not
    # up; tris: the triangles kept; tex: {material name: (base colour, alpha or None)} under the folder, for a file whose own
    # textures are missing; cutf: the share of its height (after pre) from the bottom below which a scan's stand is dropped;
    # recolor: the sRGB colour its texture is repainted to (its shading kept: each pixel's lightness over the map's mean); pca: a scan
    # left at a slant laid level by its principal axes (its length on X, its least spread up) before the turn; flip: then upside down
    return dict(folder=folder, pattern=pattern, kind=kind, size=size, turn=turn, pre=pre, tris=tris, tex=tex or {}, drop=drop, cutf=cutf, axis=axis, recolor=recolor, pca=pca, flip=flip)

CREATURES = {
    # the animated
    'osprey_perched': C('osprey', 'source/*.glb', 'skinned', turn=90),
    'osprey_flight': C('osprey-in-flight', 'source/*.glb', 'skinned', turn=90),
    'kingfisher_perched': C('belted-kingfisher', 'source/*.glb', 'skinned', turn=90),
    'kingfisher_flight': C('belted-kingfisher-in-flight', 'source/*.glb', 'skinned', turn=90),
    'loon_swim': C('common-loon-osu', 'source/*.glb', 'skinned', turn=90),
    'loon_flight': C('common-loon-in-flight', 'source/*.glb', 'skinned', turn=90),
    'eagle_flight': C('bald-eagle', 'source/*.gltf', 'skinned', turn=180, tris=40000),
    'otter_swim': C('model-96a-north-american-otter', 'source/*.fbx', 'skinned', turn=90,
                     tex={'Material': ('textures/body_col_03B_SUDBver1.png', None, 'textures/body_normal.png', 'textures/body_rough.png'),
                          'Material.001': ('textures/body_col_03B_SUDBver1.png', None, 'textures/body_normal.png', 'textures/body_rough.png')}),
    # the scans
    'hooded_merganser': C('hooded-merganser-duck-female', 'source/x/*.obj', 'static', size=0.45, turn=180, tris=40000,
                          tex={'Material': ('textures/base_texture4.png', None), 'Material.001': ('textures/base_texture4.png', None),
                               'Material.003': ('textures/duck_hair_base_color_alpha.tga.png', 'textures/duck_hair_opacity.tga.png'),
                               'Material.003_Fibers64.bmp': ('textures/duck_hair_base_color_alpha.tga.png', 'textures/duck_hair_opacity.tga.png'),
                               'Material.003_mohawkduck_lp.bmp': ('textures/duck_hair_base_color_alpha.tga.png', 'textures/duck_hair_opacity.tga.png')}),
    'mink': C('ferret', 'source/*.blend', 'static', size=0.55, tris=25000, tex={'49': ('textures/Image_0.png',)}, recolor=(0.23, 0.15, 0.10)),   # (a ferret repainted)
    'snapping_turtle': C('snapping-turtle', 'source/x/**/*.obj', 'static', size=0.55, pca=True, tris=150000),
    'painted_turtle': C('midland-painted-turtle', 'source/x/*.ply', 'static', size=0.19, pca=True, turn=180, tris=200000),
    'bullfrog': C('bullfrog', 'source/x/*.gltf', 'static', size=0.17, turn=90, tris=60000, cutf=0.22),   # (most of its mud mound cut away)
    'tadpole': C('bullfrog-tadpole', 'source/x/*.gltf', 'static', size=0.12, turn=180, tris=40000),
}

def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def load(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == '.blend': bpy.ops.wm.open_mainfile(filepath=path)
    elif ext in ('.glb', '.gltf'): bpy.ops.import_scene.gltf(filepath=path)
    elif ext == '.obj': bpy.ops.wm.obj_import(filepath=path)
    elif ext == '.fbx': bpy.ops.import_scene.fbx(filepath=path)
    elif ext == '.ply': bpy.ops.wm.ply_import(filepath=path)

def dropped(o, s):
    return o.type in ('LIGHT', 'CAMERA') or any(o.name.split('.')[0] == d for d in s['drop'])

def material(name, folder, base, alpha=None, normal=None, rough=None):
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    nt = mat.node_tree; bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    def image(rel, colour):
        n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(os.path.join(SRC, folder, rel))
        if not colour: n.image.colorspace_settings.name = 'Non-Color'
        return n
    nt.links.new(image(base, True).outputs['Color'], bsdf.inputs['Base Color'])
    if alpha: nt.links.new(image(alpha, False).outputs['Color'], bsdf.inputs['Alpha'])
    if normal:
        nm = nt.nodes.new('ShaderNodeNormalMap'); nt.links.new(image(normal, False).outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    if rough: nt.links.new(image(rough, False).outputs['Color'], bsdf.inputs['Roughness'])
    else: bsdf.inputs['Roughness'].default_value = 0.8
    return mat

def vertex_colour_material(ob):
    mat = bpy.data.materials.new('M_' + ob.name + '_vc'); mat.use_nodes = True
    nt = mat.node_tree; bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    ca = nt.nodes.new('ShaderNodeVertexColor'); ca.layer_name = ob.data.color_attributes[0].name
    nt.links.new(ca.outputs['Color'], bsdf.inputs['Base Color']); bsdf.inputs['Roughness'].default_value = 0.6
    ob.data.materials.clear(); ob.data.materials.append(mat)

def retexture(ob, name, s):
    # (a file whose own textures are missing: its materials by name dressed in the folder's)
    for slot, t in s['tex'].items():
        for i, m in enumerate(ob.data.materials):
            if m and m.name == slot: ob.data.materials[i] = material('M_' + name + '_' + str(i), s['folder'], *t)

def repaint(ob, name, rgb):
    # (its base-colour maps repainted: the target colour × each pixel's lightness over the map's mean — a ferret's masked face and pale
    # flanks become a mink's even dark brown, the fur's detail kept), saved beside the output and used in its place
    def lin(c): return ((c + 0.055) / 1.055) ** 2.4 if c > 0.04045 else c / 12.92
    tgt = np.array([lin(c) for c in rgb], dtype=np.float32)
    done = {}
    for m in ob.data.materials:
        if not m or not m.use_nodes: continue
        bsdf = next((n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if not bsdf or not bsdf.inputs['Base Color'].links: continue
        node = bsdf.inputs['Base Color'].links[0].from_node
        if node.type != 'TEX_IMAGE' or not node.image: continue
        img = node.image
        if img.name not in done:
            w, h = img.size; px = np.empty(w * h * 4, dtype=np.float32); img.pixels.foreach_get(px); px = px.reshape(-1, 4)
            lum = px[:, :3] @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32); k = lum / max(1e-4, float(lum.mean()))
            px[:, :3] = np.clip(tgt[None, :] * k[:, None], 0, 1)
            out = bpy.data.images.new(name + '_colour', w, h, alpha=True); out.pixels.foreach_set(px.ravel())
            out.filepath_raw = os.path.join(OUT, name + '_colour.png'); out.file_format = 'PNG'; out.save()
            done[img.name] = out
        node.image = done[img.name]

def principal(ob):
    # the axes of its surface (faces weighted by their area): the longest spread its length, the least its height
    me = ob.data; me.calc_loop_triangles()
    co = np.array([v.co for v in me.vertices]); tri = np.array([t.vertices for t in me.loop_triangles])
    a, b, c = co[tri[:, 0]], co[tri[:, 1]], co[tri[:, 2]]
    w = np.linalg.norm(np.cross(b - a, c - a), axis=1) / 2; ctr = (a + b + c) / 3
    m = (ctr * w[:, None]).sum(0) / w.sum(); d = ctr - m
    vals, vecs = np.linalg.eigh((d * w[:, None]).T @ d / w.sum())   # (ascending: height, width, length)
    L, Wd, D = vecs[:, 2], vecs[:, 1], vecs[:, 0]
    if np.linalg.det(np.array([L, Wd, D])) < 0: Wd = -Wd
    return Matrix((L.tolist(), Wd.tolist(), D.tolist())).to_4x4()

def box(obs):
    vs = np.concatenate([np.array([o.matrix_world @ v.co for v in o.data.vertices]) for o in obs])
    return Vector(vs.min(0)), Vector(vs.max(0))

def views(name, lo, hi):
    sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.color_type = 'TEXTURE'; sc.display.shading.light = 'STUDIO'
    sc.render.resolution_x, sc.render.resolution_y = 480, 300; sc.render.film_transparent = False
    if sc.world is None: sc.world = bpy.data.worlds.new('w')
    e = hi - lo; c = (lo + hi) / 2; far = max(e) * 10 + 1
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; cam.clip_end = far * 3; co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
    for tag, loc, rot, span in (('side', (c.x, c.y - far, c.z), (math.pi / 2, 0, 0), max(e.x, e.z)),
                                ('top', (c.x, c.y, c.z + far), (0, 0, 0), max(e.x, e.y)),
                                ('front', (c.x + far, c.y, c.z), (math.pi / 2, 0, math.pi / 2), max(e.y, e.z))):
        co.location = loc; co.rotation_euler = rot; cam.ortho_scale = span * 1.3
        sc.render.filepath = os.path.join(OUT, '%s_%s.png' % (name, tag)); bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(co, do_unlink=True)

def decimate(ob, tris):
    # (a scan stored as loose triangles — every face its own UV island, as Artec writes them — welded first, its UVs kept on the
    # corners, or the cut can't collapse anything)
    if tris and len(ob.data.vertices) > 1.5 * len(ob.data.polygons):
        import bmesh
        bm = bmesh.new(); bm.from_mesh(ob.data); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6 * max(ob.dimensions)); bm.to_mesh(ob.data); bm.free()
    nt = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    if tris and nt > tris:
        bpy.context.view_layer.objects.active = ob
        dm = ob.modifiers.new('cut', 'DECIMATE'); dm.ratio = tris / nt; dm.use_collapse_triangulate = True
        bpy.ops.object.modifier_apply(modifier=dm.name)

def bone_of(o):
    # the bone a part rides: its own bone parent, else its parent's, up the chain; (armature, bone name) or (None, None)
    p = o
    while p is not None:
        if p.parent is not None and p.parent.type == 'ARMATURE':
            return p.parent, (p.parent_bone if p.parent_type == 'BONE' and p.parent_bone else None)
        p = p.parent
    return None, None

def skinned(name, s, path):
    clear(); load(path)
    for o in list(bpy.context.scene.objects):
        if dropped(o, s): bpy.data.objects.remove(o, do_unlink=True)
    arms = [o for o in bpy.context.scene.objects if o.type == 'ARMATURE']
    if not arms: print('HB creature %s: no armature' % name); return
    main = max(arms, key=lambda a: len(a.data.bones))
    root = next(b.name for b in main.data.bones if b.parent is None)
    for a in arms: a.data.pose_position = 'REST'
    bpy.context.view_layer.update()
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    for o in meshes:
        W = o.matrix_world.copy()
        skin = next((m for m in o.modifiers if m.type == 'ARMATURE' and m.object), None)
        if skin is None:
            arm, bone = bone_of(o)
            g = o.vertex_groups.new(name=bone if (arm is main and bone) else root)
            g.add(list(range(len(o.data.vertices))), 1.0, 'REPLACE')
            skin = o.modifiers.new('Armature', 'ARMATURE')
        skin.object = main
        o.parent = None; o.matrix_world = W   # (where it stands at rest, kept; the armature modifier binds it)
    # (every empty and other armature gone — the world matrices kept above; the main armature freed of its parents too)
    W = main.matrix_world.copy(); main.parent = None; main.matrix_world = W
    for o in list(bpy.context.scene.objects):
        if o.type not in ('MESH', 'ARMATURE') or (o.type == 'ARMATURE' and o is not main): bpy.data.objects.remove(o, do_unlink=True)
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes: o.select_set(True)
    bpy.context.view_layer.objects.active = max(meshes, key=lambda o: len(o.data.vertices))
    if len(meshes) > 1: bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    retexture(ob, name, s)
    decimate(ob, s['tris'])
    # (the turn: the armature and the mesh turned together about the world origin, then the turn applied — the bones' rest turns with
    # it and the clips, kept in each bone's own space, follow)
    R = Matrix.Identity(4)
    if s['pre']: R = Matrix.Rotation(math.radians(s['pre'][1]), 4, s['pre'][0])
    R = Matrix.Rotation(math.radians(s['turn']), 4, 'Z') @ R
    for o in (main, ob): o.matrix_world = R @ o.matrix_world
    bpy.ops.object.select_all(action='DESELECT')
    for o in (main, ob): o.select_set(True)
    bpy.context.view_layer.objects.active = main
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    ob.parent = main; ob.matrix_parent_inverse = main.matrix_world.inverted()
    main.data.pose_position = 'POSE'
    acts = [a.name for a in bpy.data.actions]
    if main.animation_data is None: main.animation_data_create()
    if not main.animation_data.action and bpy.data.actions: main.animation_data.action = bpy.data.actions[0]
    bpy.context.view_layer.update()
    lo, hi = box([ob])
    os.makedirs(OUT, exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT'); main.select_set(True); ob.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, name + '.glb'), export_format='GLB', use_selection=True, export_animations=True,
                              export_skins=True, export_def_bones=False, export_animation_mode='ACTIONS')
    main.data.pose_position = 'REST'; bpy.context.view_layer.update(); lo, hi = box([ob])
    views(name, lo, hi)
    e = hi - lo
    print('HB creature %s: %s -> %d verts %d tris, %d bones, clips %s, rest %.3f x %.3f x %.3f (file units), centre %s' % (name,
          os.path.basename(path), len(ob.data.vertices), sum(len(p.vertices) - 2 for p in ob.data.polygons), len(main.data.bones), acts,
          e.x, e.y, e.z, tuple(round(v, 3) for v in (lo + hi) / 2)))

def static(name, s, path):
    clear(); load(path)
    if bpy.context.object and bpy.context.object.mode != 'OBJECT': bpy.ops.object.mode_set(mode='OBJECT')
    for o in list(bpy.context.scene.objects):
        if dropped(o, s): bpy.data.objects.remove(o, do_unlink=True)
    for o in list(bpy.context.scene.objects): o.hide_set(False); o.hide_viewport = False
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH' and not o.hide_render]
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes: o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.convert(target='MESH')   # (posed as saved, its modifiers applied)
    meshes = [o for o in bpy.context.selected_objects if o.type == 'MESH']
    for o in meshes: mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
    for o in list(bpy.context.scene.objects):
        if o not in meshes: bpy.data.objects.remove(o, do_unlink=True)
    bpy.ops.object.select_all(action='SELECT'); bpy.context.view_layer.objects.active = max(meshes, key=lambda o: len(o.data.vertices))
    if len(meshes) > 1: bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.data.transform(ob.matrix_world); ob.matrix_world = Matrix.Identity(4); ob.animation_data_clear(); ob.constraints.clear()
    retexture(ob, name, s)
    if ob.data.color_attributes and not any(m for m in ob.data.materials): vertex_colour_material(ob)
    if s['pre']: ob.data.transform(Matrix.Rotation(math.radians(s['pre'][1]), 4, s['pre'][0]))
    if s['cutf'] is not None:
        import bmesh
        lo, hi = box([ob]); zc = lo.z + s['cutf'] * (hi.z - lo.z)
        bm = bmesh.new(); bm.from_mesh(ob.data)
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < zc], context='VERTS'); bm.to_mesh(ob.data); bm.free()
    if s['recolor']: repaint(ob, name, s['recolor'])
    decimate(ob, s['tris'])
    if s['pca']: ob.data.transform(principal(ob))
    if s['flip']: ob.data.transform(Matrix.Rotation(math.pi, 4, 'X'))
    ob.data.transform(Matrix.Rotation(math.radians(s['turn']), 4, 'Z'))
    lo, hi = box([ob]); e = hi - lo; c = (lo + hi) / 2
    k = s['size'] / (e.x if s['axis'] == 'x' else max(e))
    ob.data.transform(Matrix.Scale(k, 4) @ Matrix.Translation(-Vector((c.x, c.y, lo.z)))); ob.data.update()
    os.makedirs(OUT, exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, name + '.glb'), export_format='GLB', use_selection=True, export_apply=True,
                              export_vertex_color='ACTIVE' if ob.data.color_attributes else 'MATERIAL')
    lo, hi = box([ob]); views(name, lo, hi); e = hi - lo
    print('HB creature %s: %s -> %d verts %d tris, %.3f x %.3f x %.3f m' % (name, os.path.basename(path), len(ob.data.vertices),
          sum(len(p.vertices) - 2 for p in ob.data.polygons), e.x, e.y, e.z))

names = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
for n, spec in CREATURES.items():
    if names and n not in names: continue
    files = sorted(glob.glob(os.path.join(SRC, spec['folder'], spec['pattern']), recursive=True))
    if not files: print('HB creature %s: no %s in %s' % (n, spec['pattern'], spec['folder'])); continue
    try: (skinned if spec['kind'] == 'skinned' else static)(n, spec, files[0])
    except Exception as ex:
        import traceback; traceback.print_exc(); print('HB creature %s FAILED: %s' % (n, ex))
