# build_reeds.py — the emergent plants of the lakes' edges for Unreal, made in Blender (5.1) from their parts (no model of them was to
# be had): G:\HotBrookUE\Import\plants\reed_<name>.glb, each a clump on its base at z 0 and 1 m tall — AHotBrookWeeds stretches it to
# the water's depth there and the 0.5–1.3 m the stems stand above it (plants3view's reeds):
#   - 'bulrush'      — the soft-stem bulrush (Schoenoplectus): a tuft of round grey-green stems tapering to a point, a few carrying the
#                      brown spikelet cluster a little below the tip;
#   - 'pickerelweed' — Pontederia: leaf stalks with glossy heart-shaped blades held above the water, and a purple flower spike;
#   - 'horsetail'    — water horsetail (Equisetum fluviatile): thin jointed stems, darker, ringed.
#   "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" -b --disable-autoexec -P ue/export/build_reeds.py
import bpy, bmesh, math, os, random
from mathutils import Vector
OUT = 'G:/HotBrookUE/Import/plants'

def mat(name, rgb, rough=0.6):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough; return m

def lin(h): h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]; return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)

def tube(bm, a, b, r0, r1, n=6, mi=0):
    # a tapered tube from a to b, radius r0 to r1 (its end closed when r1 is 0)
    ax = (b - a).normalized(); u = ax.orthogonal().normalized(); v = ax.cross(u)
    ring = lambda c, r: [bm.verts.new(c + (u * math.cos(2 * math.pi * k / n) + v * math.sin(2 * math.pi * k / n)) * r) for k in range(n)]
    A = ring(a, r0)
    if r1 <= 0:
        tip = bm.verts.new(b)
        for k in range(n): f = bm.faces.new((A[k], A[(k + 1) % n], tip)); f.material_index = mi
    else:
        B = ring(b, r1)
        for k in range(n): f = bm.faces.new((A[k], A[(k + 1) % n], B[(k + 1) % n], B[k])); f.material_index = mi

def blob(bm, c, rx, ry, rz, mi):
    # a small ellipsoid (a spikelet cluster, a flower spike's segment)
    r = bmesh.ops.create_uvsphere(bm, u_segments=6, v_segments=4, radius=1.0)
    for v in r['verts']: v.co = Vector((c.x + v.co.x * rx, c.y + v.co.y * ry, c.z + v.co.z * rz))
    for f in {f for v in r['verts'] for f in v.link_faces}: f.material_index = mi

def leaf(bm, base, d, length, width, mi):
    # a heart-shaped blade from its stalk's tip `base` along direction d (tilted up), its lobes back past the stalk
    d = d.normalized(); side = Vector((0, 0, 1)).cross(d).normalized(); up = d.cross(side)
    pts = []
    for k in range(13):
        t = k / 12; a = math.pi * t
        r = width * 0.5 * math.sin(a) * (1.15 - 0.6 * t)
        pts.append(base + d * (length * (1 - math.cos(a)) * 0.5 - 0.15 * length * (1 - t) ** 3) + side * r + up * 0.01 * math.sin(a))
    pts2 = [base + (p - base) - side * 2 * (p - base).dot(side) for p in pts]   # (the other half)
    vs = [bm.verts.new(p) for p in pts]; vs2 = [bm.verts.new(p) for p in pts2]; mid = bm.verts.new(base + d * length * 0.45)
    for k in range(12):
        for (a, b) in ((vs[k], vs[k + 1]), (vs2[k + 1], vs2[k])):
            f = bm.faces.new((mid, a, b)); f.material_index = mi

def build(name, maker, mats):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); random.seed(hash(name) & 0xffff)
    maker(bm)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    for m in mats: me.materials.append(m)
    for p in me.polygons: p.use_smooth = True
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active = ob
    os.makedirs(OUT, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'reed_' + name + '.glb'), export_format='GLB', use_selection=True)
    print('HB reed %s: %d tris' % (name, sum(len(p.vertices) - 2 for p in me.polygons)))
    bpy.data.objects.remove(ob, do_unlink=True)

def bulrush(bm):
    for k in range(16):
        x, y = random.uniform(-0.09, 0.09), random.uniform(-0.09, 0.09); h = random.uniform(0.82, 1.0); lean = Vector((random.uniform(-0.06, 0.06), random.uniform(-0.06, 0.06), 0))
        a, b = Vector((x, y, 0)), Vector((x, y, h)) + lean
        tube(bm, a, b, 0.006, 0.0, 6, 0)
        if k % 3 == 0: blob(bm, a + (b - a) * 0.86 + Vector((0.008, 0, 0)), 0.012, 0.01, 0.025, 1)

def pickerelweed(bm):
    for k in range(7):
        ang = 2 * math.pi * k / 7 + random.uniform(-0.3, 0.3); h = random.uniform(0.7, 0.9)
        base = Vector((random.uniform(-0.05, 0.05), random.uniform(-0.05, 0.05), 0)); top = base + Vector((math.cos(ang) * 0.06, math.sin(ang) * 0.06, h))
        tube(bm, base, top, 0.006, 0.004, 5, 0)
        leaf(bm, top, Vector((math.cos(ang), math.sin(ang), 1.6)), 0.2, 0.13, 0)
    for k in range(2):   # (the flower spikes: violet-blue, standing above the leaves)
        base = Vector((random.uniform(-0.03, 0.03), random.uniform(-0.03, 0.03), 0)); top = base + Vector((0, 0, 1.0))
        tube(bm, base, top, 0.005, 0.004, 5, 0)
        for j in range(6): blob(bm, top + Vector((0, 0, 0.02 + 0.022 * j)), 0.016, 0.016, 0.014, 1)

def horsetail(bm):
    for k in range(22):
        x, y = random.uniform(-0.12, 0.12), random.uniform(-0.12, 0.12); h = random.uniform(0.8, 1.0)
        a = Vector((x, y, 0)); b = Vector((x + random.uniform(-0.03, 0.03), y + random.uniform(-0.03, 0.03), h))
        n = 7
        for j in range(n):   # (jointed: segments, each joint's dark ring)
            p0, p1 = a + (b - a) * (j / n), a + (b - a) * ((j + 1) / n)
            tube(bm, p0, p1, 0.0035, 0.0032, 6, 0); tube(bm, p1 - (b - a) * 0.004, p1 + (b - a) * 0.004, 0.0038, 0.0038, 6, 1)

for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
build('bulrush', bulrush, [mat('M_bulrush_stem', lin('#6f8a4a'), 0.55), mat('M_bulrush_spike', lin('#6a4a2a'), 0.8)])
build('pickerelweed', pickerelweed, [mat('M_pickerel_leaf', lin('#4f7a2e'), 0.35), mat('M_pickerel_flower', lin('#6a58b8'), 0.6)])
build('horsetail', horsetail, [mat('M_horsetail_stem', lin('#4d6b38'), 0.5), mat('M_horsetail_ring', lin('#1e2418'), 0.6)])
