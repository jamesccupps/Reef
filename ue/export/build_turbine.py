# build_turbine.py — the wind turbines on the ridges south-west of the lakes (the Stetson wind farm and its expansion: GE 1.5-77s,
# the US Wind Turbine Database's) for Unreal, made in Blender (5.1) from their published dimensions — no model of them was to be had:
# G:\HotBrookUE\Import\landmarks\turbine_tower.glb and turbine_rotor.glb:
#   - the TOWER: a white tapered steel tube from its base (z 0) to the 80-m hub height (4.3 m across at the foot, 2.6 m at the top),
#     the nacelle on it (~8.5 × 3.4 × 3.6 m, rounded, its front at +X) with the hub's spinner; the rotor's centre at (2.6, 0, 81.6) m;
#   - the ROTOR: the spinner and three 37.5-m blades (a 77-m rotor), its axis along +X at the origin — the game turns it about X and
#     stands it at the tower's hub, the whole turbine yawed into the wind. Blades: a root cylinder into an aerofoil-ish blade, its
#     chord widest (2.4 m) a few metres out, tapering to the tip, a little twist.
#   "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" -b --disable-autoexec -P ue/export/build_turbine.py
import bpy, bmesh, math, os
from mathutils import Vector, Matrix
OUT = 'G:/HotBrookUE/Import/landmarks'
HUB = Vector((2.6, 0.0, 81.6))

def mat(name, rgb, rough):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough; return m

def ring(bm, z, r, n, ox=0.0):
    return [bm.verts.new((ox + r * math.cos(2 * math.pi * k / n), r * math.sin(2 * math.pi * k / n), z)) for k in range(n)]

def bridge(bm, A, B, mi=0):
    n = len(A)
    for k in range(n):
        f = bm.faces.new((A[k], A[(k + 1) % n], B[(k + 1) % n], B[k])); f.material_index = mi

def cap(bm, A, mi=0, up=True):
    f = bm.faces.new(A if up else list(reversed(A))); f.material_index = mi

def export(name, bm, mats):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    for m in mats: me.materials.append(m)
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active = ob
    os.makedirs(OUT, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, name + '.glb'), export_format='GLB', use_selection=True)
    print('HB turbine %s: %d tris' % (name, sum(len(p.vertices) - 2 for p in me.polygons)))

for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
WHITE = mat('M_turbine_white', (0.78, 0.79, 0.80), 0.35)
GREY = mat('M_turbine_grey', (0.35, 0.36, 0.37), 0.5)

# the tower and the nacelle
bm = bmesh.new()
rings = [ring(bm, z, 2.15 - (2.15 - 1.3) * (z / 80.0), 32) for z in (0.0, 20.0, 40.0, 60.0, 80.0)]
for a, b in zip(rings, rings[1:]): bridge(bm, a, b)
cap(bm, rings[0], up=False); cap(bm, rings[-1])
# (a door at its foot: a darker panel)
n = bmesh.ops.create_cube(bm, size=1.0)
for v in n['verts']: v.co = Vector((2.12 + v.co.x * 0.08, v.co.y * 0.9, 1.2 + v.co.z * 2.2))
for f in {f for v in n['verts'] for f in v.link_faces}: f.material_index = 1
# the nacelle: a rounded box, its front (+X) toward the rotor
nac = bmesh.ops.create_cube(bm, size=1.0)
for v in nac['verts']: v.co = Vector((-1.6 + v.co.x * 8.5, v.co.y * 3.4, 81.6 + v.co.z * 3.6))
NV = set(nac['verts']); bmesh.ops.bevel(bm, geom=[e for e in bm.edges if e.verts[0] in NV and e.verts[1] in NV], offset=0.6, segments=3, affect='EDGES')
export('turbine_tower', bm, [WHITE, GREY])

# the rotor: the spinner and three blades about +X
bm = bmesh.new()
sp = [ring(bm, 0.0, r, 24) for r in (1.6, 1.5, 1.1, 0.5)]
for i, rr in enumerate(sp):   # (laid along X: the rings at x 0 … 3.2)
    for v in rr: v.co = Vector((i * 1.0, v.co.x, v.co.y))
for a, b in zip(sp, sp[1:]): bridge(bm, list(reversed(a)), list(reversed(b)))
tip = bm.verts.new((3.4, 0, 0))
for k in range(len(sp[-1])):
    a, b = sp[-1][k], sp[-1][(k + 1) % len(sp[-1])]; bm.faces.new((b, a, tip))
cap(bm, sp[0], up=True)
def blade(angle):
    # stations from the root (r 1.5 m) to the tip (r 38.5 m): chord, thickness, twist — rotated about X by angle
    R = Matrix.Rotation(angle, 4, 'X')
    st = [(1.5, 1.0, 1.0, 0.0), (3.0, 1.6, 0.9, 12.0), (6.0, 2.4, 0.55, 10.0), (12.0, 2.0, 0.38, 6.0), (20.0, 1.5, 0.25, 3.0), (30.0, 1.0, 0.15, 1.0), (38.5, 0.35, 0.05, 0.0)]
    secs = []
    for r, c, t, tw in st:
        pts = []
        for k in range(12):   # (an ellipse-ish aerofoil: rounded leading edge, thin trailing edge)
            a = 2 * math.pi * k / 12
            x = c * (0.5 * math.cos(a) + 0.15 * (1 - math.cos(a)) * 0.0); y = t * 0.5 * math.sin(a) * (1.0 if math.cos(a) > -0.2 else 0.7)
            p = Matrix.Rotation(math.radians(tw), 4, 'Z') @ Vector((y, x - 0.15 * c, 0.0))
            pts.append(R @ Vector((0.9 + p.x, p.y, r)))
        secs.append([bm.verts.new(p) for p in pts])
    for a, b in zip(secs, secs[1:]): bridge(bm, a, b)
    cap(bm, secs[-1])
for k in range(3): blade(2 * math.pi * k / 3)
export('turbine_rotor', bm, [WHITE])
print('HB turbine: hub at', tuple(round(c, 2) for c in HUB))
