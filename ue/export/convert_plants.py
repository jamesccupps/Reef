# convert_plants.py — the plants and the ground's pieces the human downloaded (2026-10-24) made uniform for Unreal, in Blender (5.1),
# into G:\HotBrookUE\Import\plants\<name>.glb with three views each to check by:
#   - the WATER PLANTS (Valery.Li's): the fragrant water-lily (Nymphaea odorata — the lakes' commonest lily, the sim's 'whitelily'),
#     the "lake lily" (the yellow pond-lily's and watershield's stand-in), the pondweed (Potamogeton: the sim's submerged pondweeds) —
#     each a clump with its stems down to the bed: set with the pads' level (the water's surface) at z 0, its stems below (the
#     yellow pond-lily's pads 25–30 cm: the clump 0.32 m); the pondweed stands on the bed (its base at z 0: drawn up toward the surface);
#   - the GROUND: the grass clumps (Cosmic_dust's three: a lawn's, two autumn tufts), POLYSCAN's fern grass, the stones-and-grass scan
#     (cut to a Nanite budget) — on their base at z 0.
# Each its real size (m: `size`, its longest across), the file's own up kept unless `pre` turns it. Every leaf's cut-out made a CUT-OUT
# (glTF MASK: Unreal's Masked, which Nanite draws and which casts shadows), not see-through (BLEND, as they came): an alpha through a
# Math 'greater than 0.5' node is what the glTF exporter writes as MASK.
#   "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" -b --disable-autoexec -P ue/export/convert_plants.py -- [name …]
# The models stay out of the repository (their licences — ue/README.md credits them); this script is ours.
import bpy, glob, math, os, sys
import numpy as np
from mathutils import Matrix, Vector
SRC = 'G:/HotBrookUE/Import/sketchfab'
OUT = 'G:/HotBrookUE/Import/plants'

def P(path, size, kind, keep=None, pre=None, tris=None, tex=None, drop=()):
    # kind 'water' (its top — the pads — at z 0) or 'ground' (its base at z 0); keep: the mesh objects' names kept (None: all);
    # tex: {material: (base colour, alpha or None, normal or None)} for a file whose maps it doesn't find; drop: materials whose faces go
    return dict(path=path, size=size, kind=kind, keep=keep, pre=pre, tris=tris, tex=tex or {}, drop=drop)

GRASS_TEX = {'Grass_Mat': ('grass/textures/Grass.png', None, None), 'Grass1_Mat': ('grass/textures/Grass1.png', 'grass/textures/Grass1_Opacity.png', 'grass/textures/Grass1_Normal.png'), 'Grass2_Mat': ('grass/textures/Grass2.png', 'grass/textures/Grass2_Opacity.png', 'grass/textures/Grass2_Normal.png'), 'Grass3_Mat': ('grass/textures/Grass3.png', 'grass/textures/Grass3_Opacity.png', 'grass/textures/Grass3_Normal.png')}   # (its materials by name: Grass1_Mat, Grass1_Mat1, … each its set)
PLANTS = {
    'white_lily': P('water-lily-nymphaea-odorata/source/x/*/WaterLily_Med.fbx', 1.6, 'water', pre=('X', -90), tris=20000),   # (Y DOWN in the file: +90 stood them on their pads, stems in the air)
    # (the small floating leaves — watershield's 5–12-cm pads, floating pondweed's and bur-reed's: the water-lily's pads without its flowers, small)
    'lily_pads': P('water-lily-nymphaea-odorata/source/x/*/WaterLily_Med.fbx', 0.6, 'water', pre=('X', -90), tris=12000, drop=('WaterLilyFlower_Mat',)),
    'lake_lily': P('lake-lily-med/source/x/*/LakeLily_Med.fbx', 0.32, 'water', pre=('X', -90), tris=2000),
    'pondweed': P('pond-weed/source/x/*/PondWeed_Med.fbx', 0.9, 'ground', pre=('X', -90)),
    'grass_lawn': P('grass/source/Grass.fbx', 0.35, 'ground', keep=('GrassLawnAutumn',), tex=GRASS_TEX),
    'grass_tuft_a': P('grass/source/Grass.fbx', 0.45, 'ground', keep=('Grass1',), tex=GRASS_TEX),
    'grass_tuft_b': P('grass/source/Grass.fbx', 0.5, 'ground', keep=('GrassAutumn3',), tex=GRASS_TEX),
    'fern_grass': P('fern-grass-02/source/x/*.obj', 0.6, 'ground', tex={'Material': ('fern-grass-02/textures/2023-11-23T113343Z.png', None, 'fern-grass-02/textures/generatedT113338Z_NormalMap.png')}),
    'stones_grass': P('stones-and-grass/source/*.fbx', 1.1, 'ground', tris=200000),
}

def clear(): bpy.ops.wm.read_factory_settings(use_empty=True)
def load(path):
    ext = os.path.splitext(path)[1].lower()
    if ext in ('.glb', '.gltf'): bpy.ops.import_scene.gltf(filepath=path)
    elif ext == '.obj': bpy.ops.wm.obj_import(filepath=path)
    elif ext == '.fbx': bpy.ops.import_scene.fbx(filepath=path)

def material(name, base, alpha=None, normal=None):
    mat = bpy.data.materials.new(name); mat.use_nodes = True; nt = mat.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    def img(rel, colour):
        n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(os.path.join(SRC, rel))
        if not colour: n.image.colorspace_settings.name = 'Non-Color'
        return n
    c = img(base, True); nt.links.new(c.outputs['Color'], b.inputs['Base Color'])
    if alpha: nt.links.new(img(alpha, False).outputs['Color'], b.inputs['Alpha'])
    else: nt.links.new(c.outputs['Alpha'], b.inputs['Alpha'])   # (a cut-out leaf's alpha in its colour map)
    if normal:
        nm = nt.nodes.new('ShaderNodeNormalMap'); nt.links.new(img(normal, False).outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    b.inputs['Roughness'].default_value = 0.7
    return mat

def cutout(ob):
    # (each material whose alpha is linked: through 'greater than 0.5' — glTF MASK)
    for m in ob.data.materials:
        if not m or not m.use_nodes: continue
        nt = m.node_tree; b = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if not b or not b.inputs['Alpha'].is_linked: continue
        l = b.inputs['Alpha'].links[0]; src = l.from_socket
        if l.from_node.type == 'MATH' and l.from_node.operation in ('GREATER_THAN', 'ROUND'): continue
        g = nt.nodes.new('ShaderNodeMath'); g.operation = 'GREATER_THAN'; g.inputs[1].default_value = 0.5
        nt.links.remove(l); nt.links.new(src, g.inputs[0]); nt.links.new(g.outputs[0], b.inputs['Alpha'])
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass

def views(name, ob):
    sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.color_type = 'TEXTURE'; sc.display.shading.light = 'STUDIO'
    sc.render.resolution_x, sc.render.resolution_y = 480, 300
    if sc.world is None: sc.world = bpy.data.worlds.new('w')
    v = np.array([x.co for x in ob.data.vertices]); lo, hi = Vector(v.min(0)), Vector(v.max(0)); e = hi - lo; c = (lo + hi) / 2; far = max(e) * 10 + 1
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; cam.clip_end = far * 3; co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
    for tag, loc, rot, span in (('side', (c.x, c.y - far, c.z), (math.pi / 2, 0, 0), max(e.x, e.z)), ('top', (c.x, c.y, c.z + far), (0, 0, 0), max(e.x, e.y))):
        co.location = loc; co.rotation_euler = rot; cam.ortho_scale = span * 1.2
        sc.render.filepath = os.path.join(OUT, '%s_%s.png' % (name, tag)); bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(co, do_unlink=True)

def convert(name, s):
    files = sorted(glob.glob(os.path.join(SRC, s['path'])))
    if not files: print('HB plant %s: no %s' % (name, s['path'])); return
    clear(); load(files[0])
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH' and len(o.data.vertices) and (not s['keep'] or o.name.split('.')[0] in s['keep'])]
    for o in list(bpy.context.scene.objects):
        if o not in meshes: bpy.data.objects.remove(o, do_unlink=True)
    for o in meshes: mw = o.matrix_world.copy(); o.parent = None; o.data.transform(mw); o.matrix_world = Matrix.Identity(4)
    bpy.ops.object.select_all(action='SELECT'); bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1: bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    if s['drop']:
        import bmesh
        bm = bmesh.new(); bm.from_mesh(ob.data)
        gone = {i for i, m in enumerate(ob.data.materials) if m and m.name.split('.')[0] in s['drop']}
        bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.material_index in gone], context='FACES'); bm.to_mesh(ob.data); bm.free()
    for slot, t in s['tex'].items():
        for i, m in enumerate(ob.data.materials):
            if m and (m.name.split('.')[0] == slot or m.name.split('.')[0].rstrip('0123456789') == slot): ob.data.materials[i] = material('M_' + name + '_' + slot, *t)
    if s['pre']: ob.data.transform(Matrix.Rotation(math.radians(s['pre'][1]), 4, s['pre'][0]))
    nt = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    if s['tris'] and nt > s['tris']:
        dm = ob.modifiers.new('cut', 'DECIMATE'); dm.ratio = s['tris'] / nt; dm.use_collapse_triangulate = True; bpy.ops.object.modifier_apply(modifier=dm.name)
    v = np.array([x.co for x in ob.data.vertices]); lo, hi = v.min(0), v.max(0); e = hi - lo
    k = s['size'] / max(e[0], e[1])
    if s['kind'] == 'water':
        # (the pads' level: the commonest height of the faces that look up — the pads lie flat on the water)
        me = ob.data; zs = [ (sum(me.vertices[i].co.z for i in p.vertices) / len(p.vertices)) for p in me.polygons if p.normal.z > 0.9 ]
        zt = float(np.median(zs)) if zs else hi[2]
        ob.data.transform(Matrix.Scale(k, 4) @ Matrix.Translation(Vector((-(lo[0] + hi[0]) / 2, -(lo[1] + hi[1]) / 2, -zt))))
    else:
        ob.data.transform(Matrix.Scale(k, 4) @ Matrix.Translation(Vector((-(lo[0] + hi[0]) / 2, -(lo[1] + hi[1]) / 2, -lo[2]))))
    ob.data.update(); cutout(ob)
    os.makedirs(OUT, exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, name + '.glb'), export_format='GLB', use_selection=True, export_apply=True)
    views(name, ob)
    v = np.array([x.co for x in ob.data.vertices]); lo, hi = v.min(0), v.max(0); e = hi - lo
    print('HB plant %s: %s -> %d tris, %.2f x %.2f x %.2f m, z %.2f..%.2f, mats %s' % (name, os.path.basename(files[0]), sum(len(p.vertices) - 2 for p in ob.data.polygons),
          e[0], e[1], e[2], lo[2], hi[2], [m.name for m in ob.data.materials if m]))

names = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
for n, spec in PLANTS.items():
    if names and n not in names: continue
    try: convert(n, spec)
    except Exception as ex:
        import traceback; traceback.print_exc(); print('HB plant %s FAILED: %s' % (n, ex))
