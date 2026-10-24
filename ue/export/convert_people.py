# convert_people.py — the people on the lakes for Unreal, in Blender (5.1): the two scanned men the human downloaded (the wanted list
# of 2026-10-24) given the clips an angler needs and written as skinned .glb's to G:\HotBrookUE\Import\creatures\:
#   - 'angler_summer' — Renderpeople's "Nathan" (jeans, a T-shirt; his own walk kept as 'walk');
#   - 'angler_winter' — evan4129's "Rigged Game Character 1" (hoodie, beanie, mittens, boots; on the UE4 mannequin's skeleton).
# Neither came with a seat, so the clips are posed here, bone by bone: each limb bone turned about its own joint until it points where
# the pose wants it (its child joint's direction) — the body seated on a boat's thwart or a bucket, thighs level, shins down, the rod
# held before the belly in both hands:
#   'sit'  (4 s) still in the seat, breathing, the head turning slowly to look along the water;
#   'cast' (1.2 s) the rod swept back over the right shoulder and snapped forward;
#   'reel' (1 s) the right hand cranking the reel;
#   'jig'  (1 s) the ice angler's short lift of the rod tip and the drop.
# Each faces +X with its head up (+Z), at the file's own size (import_creatures.py measures it; the game scales a man to his height).
# And the ROD (ergin3d's spinning rod) as a still mesh, 2.1 m, butt at the origin, tip along +X.
#   "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" -b --disable-autoexec -P ue/export/convert_people.py
import bpy, math, os, sys
import numpy as np
from mathutils import Matrix, Vector
SRC = 'G:/HotBrookUE/Import/sketchfab'
OUT = 'G:/HotBrookUE/Import/creatures'
FPS = 30

# the joints by role -> each skeleton's bone name (the child that gives a bone's direction is the next in its chain)
UE4 = {'spine1': 'spine_01', 'spine2': 'spine_02', 'spine3': 'spine_03', 'neck': 'neck_01', 'head': 'head', 'head_end': 'head_end',
       'upperarm_l': 'upperarm_l', 'lowerarm_l': 'lowerarm_l', 'hand_l': 'hand_l', 'finger_l': 'middle_01_l',
       'upperarm_r': 'upperarm_r', 'lowerarm_r': 'lowerarm_r', 'hand_r': 'hand_r', 'finger_r': 'middle_01_r',
       'thigh_l': 'thigh_l', 'calf_l': 'calf_l', 'foot_l': 'foot_l', 'ball_l': 'ball_l',
       'thigh_r': 'thigh_r', 'calf_r': 'calf_r', 'foot_r': 'foot_r', 'ball_r': 'ball_r'}
RP = 'rp_nathan_animated_003_walking_'
NATHAN = {'spine1': RP + 'spine_01', 'spine2': RP + 'spine_02', 'spine3': RP + 'spine_03', 'neck': RP + 'neck', 'head': RP + 'head', 'head_end': RP + 'head_end',
          'upperarm_l': RP + 'upperarm_l', 'lowerarm_l': RP + 'lowerarm_l', 'hand_l': RP + 'hand_l', 'finger_l': RP + 'middle_01_l',
          'upperarm_r': RP + 'upperarm_r', 'lowerarm_r': RP + 'lowerarm_r', 'hand_r': RP + 'hand_r', 'finger_r': RP + 'middle_01_r',
          'thigh_l': RP + 'upperleg_l', 'calf_l': RP + 'lowerleg_l', 'foot_l': RP + 'foot_l', 'ball_l': RP + 'ball_l',
          'thigh_r': RP + 'upperleg_r', 'calf_r': RP + 'lowerleg_r', 'foot_r': RP + 'foot_r', 'ball_r': RP + 'ball_r'}
# (each posed bone and the joint whose direction from it is set — parents before children; the head is turned, not pointed: a
# UE4 skeleton's head_end points back, not up)
CHAIN = [('spine1', 'spine2'), ('spine2', 'spine3'), ('spine3', 'neck'), ('neck', 'head'),
         ('upperarm_l', 'lowerarm_l'), ('lowerarm_l', 'hand_l'), ('hand_l', 'finger_l'),
         ('upperarm_r', 'lowerarm_r'), ('lowerarm_r', 'hand_r'), ('hand_r', 'finger_r'),
         ('thigh_l', 'calf_l'), ('calf_l', 'foot_l'), ('foot_l', 'ball_l'),
         ('thigh_r', 'calf_r'), ('calf_r', 'foot_r'), ('foot_r', 'ball_r')]

# the file's frame: both men face -Y, their left hand at +X, up +Z
F, Lf, U = Vector((0, -1, 0)), Vector((1, 0, 0)), Vector((0, 0, 1))
def d(f=0.0, l=0.0, u=0.0): return (F * f + Lf * l + U * u).normalized()

def seated(head_yaw=0.0, head_pitch=-0.15, lean=0.12, breath=0.0):
    # the seated angler, the rod before the belly: thighs level, shins down, the forearms forward and in to the reel
    hy = head_yaw
    return {'spine1': d(lean, 0, 1), 'spine2': d(lean + breath, 0, 1), 'spine3': d(lean * 0.5 + breath, 0, 1),
            'neck': d(0.2, 0, 1), 'head_turn': (hy, head_pitch),
            'thigh_l': d(1, 0.14, -0.08), 'calf_l': d(0.22, 0.02, -1), 'foot_l': d(1, 0.05, -0.35),
            'thigh_r': d(1, -0.14, -0.08), 'calf_r': d(0.22, -0.02, -1), 'foot_r': d(1, -0.05, -0.35),
            'upperarm_l': d(0.55, 0.22, -0.8), 'lowerarm_l': d(1, -0.45, 0.25), 'hand_l': d(1, -0.3, 0.1),
            'upperarm_r': d(0.5, -0.25, -0.85), 'lowerarm_r': d(1, 0.3, 0.3), 'hand_r': d(1, 0.15, 0.35)}

def with_(base, **kw):
    p = dict(base); p.update(kw); return p

def clips():
    out = {}
    # sit: 4 s — breathing (two breaths), the head looking left, ahead, right, ahead
    S = []
    for f, yaw, br in ((0, 0.0, 0.0), (30, 0.35, 0.03), (60, 0.0, 0.0), (90, -0.35, 0.03), (120, 0.0, 0.0)):
        S.append((f, seated(head_yaw=yaw, breath=br)))
    out['sit'] = S
    base = seated()
    # cast: 1.2 s — the rod hand up and back over the right shoulder, then snapped forward and down to the sit
    out['cast'] = [(0, base),
                   (12, with_(base, spine3=d(-0.1, 0, 1), upperarm_r=d(0.15, -0.35, 0.9), lowerarm_r=d(-0.6, 0.1, 0.8), hand_r=d(-0.8, 0, 0.6),
                              upperarm_l=d(0.6, 0.1, -0.2), lowerarm_l=d(0.6, -0.5, 0.6))),
                   (18, with_(base, spine3=d(0.35, 0, 1), upperarm_r=d(0.85, -0.2, 0.35), lowerarm_r=d(1, 0.1, 0.15), hand_r=d(1, 0, 0.1))),
                   (36, base)]
    # reel: 1 s — the right forearm and hand turning the crank (a small circle before the belly)
    R = []
    for k in range(5):
        a = 2 * math.pi * k / 4
        R.append((k * 7.5, with_(base, lowerarm_r=d(1, 0.3 + 0.12 * math.cos(a), 0.3 + 0.12 * math.sin(a)), hand_r=d(1, 0.15 + 0.2 * math.cos(a), 0.35 + 0.2 * math.sin(a)))))
    out['reel'] = R
    # jig: 1 s — the short rod lifted a hand's breadth and let fall
    out['jig'] = [(0, base), (6, with_(base, lowerarm_r=d(1, 0.3, 0.6), hand_r=d(1, 0.15, 0.75))), (12, base), (30, base)]
    return out

def fcurves(a):
    # (an action's curves — Blender 5's layered actions keep them in their strips' channel bags)
    try: return list(a.fcurves)
    except Exception: return [fc for l in a.layers for st in l.strips for cb in st.channelbags for fc in cb.fcurves]

def reset(arm):
    for pb in arm.pose.bones:
        pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = (1, 0, 0, 0); pb.location = (0, 0, 0); pb.scale = (1, 1, 1)
    bpy.context.view_layer.update()

def apply_pose(arm, names, pose):
    R0 = arm.matrix_world.to_3x3().normalized().inverted()
    for bone, child in CHAIN:
        if bone not in pose or names[bone] not in arm.pose.bones or names[child] not in arm.pose.bones: continue
        pb, pc = arm.pose.bones[names[bone]], arm.pose.bones[names[child]]
        cur = (pc.head - pb.head)
        if cur.length < 1e-6: continue
        want = R0 @ pose[bone]
        q = cur.normalized().rotation_difference(want.normalized())
        h = pb.head.copy()
        pb.matrix = Matrix.Translation(h) @ q.to_matrix().to_4x4() @ Matrix.Translation(-h) @ pb.matrix
        bpy.context.view_layer.update()
    if 'head_turn' in pose and names['head'] in arm.pose.bones:   # (the head turned about the up axis, then nodded about the left)
        yaw, pitch = pose['head_turn']; pb = arm.pose.bones[names['head']]; h = pb.head.copy()
        q = Matrix.Rotation(pitch, 4, R0 @ Lf) @ Matrix.Rotation(yaw, 4, R0 @ U)
        pb.matrix = Matrix.Translation(h) @ q @ Matrix.Translation(-h) @ pb.matrix
        bpy.context.view_layer.update()

def key(arm, names, frame):
    for role in names.values():
        if role in arm.pose.bones and role not in (names['head_end'],):
            pb = arm.pose.bones[role]; pb.keyframe_insert('rotation_quaternion', frame=frame); pb.keyframe_insert('location', frame=frame)

def make_clip(arm, names, name, keys):
    act = bpy.data.actions.new(name)
    if arm.animation_data is None: arm.animation_data_create()
    arm.animation_data.action = act
    for f, pose in keys:
        reset(arm); apply_pose(arm, names, pose); key(arm, names, f)
    act.use_fake_user = True
    return act

def person(name, path, names, keep_own=None, tex=None):
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.fbx(filepath=path)
    bpy.context.scene.render.fps = FPS
    arm = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    for o in meshes:
        if o.data.shape_keys: o.shape_key_clear()
        if tex:   # (a file whose maps it doesn't find: its material rebuilt on the folder's — colour and roughness)
            mat = bpy.data.materials.new('M_' + name); mat.use_nodes = True; nt = mat.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
            for key, f in tex.items():
                n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(os.path.join(SRC, f))
                if key != 'Base Color': n.image.colorspace_settings.name = 'Non-Color'
                nt.links.new(n.outputs['Color'], b.inputs[key])
            o.data.materials.clear(); o.data.materials.append(mat)
    own = list(bpy.data.actions)
    for a in own:
        if keep_own: a.name = keep_own; a.use_fake_user = True
        else: bpy.data.actions.remove(a)
    for clip, keys in clips().items():
        if name == 'angler_summer' and clip == 'jig': continue
        if name == 'angler_winter' and clip in ('cast', 'reel'): continue
        make_clip(arm, names, clip, keys)
    reset(arm)
    # (the armature's scale put into its bones — Nathan's file holds him in centimetres under a 0.01 parent, which Unreal ignores for a
    # skinned mesh — and every clip's moves scaled with it, as applying a scale leaves them)
    k = arm.matrix_world.to_scale()[0]
    for o in [arm] + meshes: mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
    if abs(k - 1) > 1e-4:
        bpy.ops.object.select_all(action='DESELECT'); arm.select_set(True); bpy.context.view_layer.objects.active = arm
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        for a in bpy.data.actions:
            for fc in fcurves(a):
                if fc.data_path.endswith('.location'):
                    for kp in fc.keyframe_points: kp.co[1] *= k; kp.handle_left[1] *= k; kp.handle_right[1] *= k
    for o in list(bpy.context.scene.objects):
        if o.type == 'EMPTY': bpy.data.objects.remove(o, do_unlink=True)
    # (faced along +X: the armature and its meshes turned together about the origin and the turn applied)
    R = Matrix.Rotation(math.radians(90), 4, 'Z')
    for o in [arm] + meshes: o.matrix_world = R @ o.matrix_world
    bpy.ops.object.select_all(action='DESELECT')
    for o in [arm] + meshes: o.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    # (each mesh's own transform put into its vertices and it parented straight to the armature: Unreal ignores a skinned mesh's
    # node transform — Nathan's mesh, scaled 0.01 under its armature, came in a hundredth of his size)
    for o in meshes:
        mw = o.matrix_world.copy(); o.parent = None; o.data.transform(mw); o.matrix_world = Matrix.Identity(4)
        o.parent = arm; o.matrix_parent_inverse = arm.matrix_world.inverted()
        for m in o.modifiers:
            if m.type == 'ARMATURE': m.object = arm
    arm.animation_data.action = bpy.data.actions['sit']
    os.makedirs(OUT, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, name + '.glb'), export_format='GLB', use_selection=True, export_animations=True,
                              export_skins=True, export_def_bones=False, export_animation_mode='ACTIONS', export_force_sampling=True)
    # (views of the seated pose and of the cast's top to check by)
    bpy.context.scene.frame_set(0)
    views(name, meshes)
    print('HB person %s: %s, %d bones, clips %s' % (name, os.path.basename(path), len(arm.data.bones), [a.name for a in bpy.data.actions]))

def views(name, meshes):
    sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.color_type = 'TEXTURE'; sc.display.shading.light = 'STUDIO'
    sc.render.resolution_x, sc.render.resolution_y = 400, 400
    if sc.world is None: sc.world = bpy.data.worlds.new('w')
    dg = bpy.context.evaluated_depsgraph_get()
    vs = []
    for o in meshes:
        e = o.evaluated_get(dg); me = e.to_mesh(); vs += [e.matrix_world @ v.co for v in me.vertices]; e.to_mesh_clear()
    v = np.array(vs); lo, hi = Vector(v.min(0)), Vector(v.max(0)); c = (lo + hi) / 2; span = max(hi - lo) * 1.2
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; cam.ortho_scale = span; cam.clip_end = 100
    co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
    for tag, loc, rot in (('side', (c.x, c.y - 20, c.z), (math.pi / 2, 0, 0)), ('front', (c.x + 20, c.y, c.z), (math.pi / 2, 0, math.pi / 2))):
        co.location = loc; co.rotation_euler = rot
        sc.render.filepath = os.path.join(OUT, '%s_%s.png' % (name, tag)); bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(co, do_unlink=True)

def rod():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=os.path.join(SRC, 'fishing-rod-rigged-and-animated/source/x/rod06.FBX'))
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    for o in meshes:
        for m in list(o.modifiers): o.modifiers.remove(m)   # (its rest shape — straight)
        mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
    for o in list(bpy.context.scene.objects):
        if o.type != 'MESH': bpy.data.objects.remove(o, do_unlink=True)
    bpy.ops.object.select_all(action='SELECT'); bpy.context.view_layer.objects.active = meshes[0]; bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.data.transform(ob.matrix_world); ob.matrix_world = Matrix.Identity(4)
    for i, m in enumerate(ob.data.materials):   # (its maps beside the FBX: the rod's colour, normal, roughness and metal)
        if m and m.name.startswith('rod06'):
            mat = bpy.data.materials.new('M_rod'); mat.use_nodes = True; nt = mat.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
            def img(f, colour):
                n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(os.path.join(SRC, 'fishing-rod-rigged-and-animated/source/x', f))
                if not colour: n.image.colorspace_settings.name = 'Non-Color'
                return n
            nt.links.new(img('rod06_Base_Color.png', True).outputs['Color'], b.inputs['Base Color'])
            nt.links.new(img('rod06_Roughness.PNG', False).outputs['Color'], b.inputs['Roughness'])
            nt.links.new(img('rod06_Metallic.PNG', False).outputs['Color'], b.inputs['Metallic'])
            nm = nt.nodes.new('ShaderNodeNormalMap'); nt.links.new(img('rod06_Normal.png', False).outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
            ob.data.materials[i] = mat
    v = np.array([x.co for x in ob.data.vertices]); lo, hi = v.min(0), v.max(0)
    # (the butt at +X in the file: turned to put the tip along +X, then sized to 2.1 m and the butt set at the origin)
    ob.data.transform(Matrix.Rotation(math.pi, 4, 'Z'))
    v = np.array([x.co for x in ob.data.vertices]); lo, hi = v.min(0), v.max(0); k = 2.1 / (hi[0] - lo[0])
    ob.data.transform(Matrix.Scale(k, 4) @ Matrix.Translation(Vector((-lo[0], -(lo[1] + hi[1]) / 2, -(lo[2] + hi[2]) / 2))))
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'rod.glb'), export_format='GLB', use_selection=False, export_apply=True)
    v = np.array([x.co for x in ob.data.vertices]); e = v.max(0) - v.min(0)
    print('HB rod: %d verts, %.2f x %.3f x %.3f m' % (len(ob.data.vertices), *e))

names = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
if not names or 'angler_summer' in names:
    person('angler_summer', os.path.join(SRC, 'nathan-animated-003-walking-3d-man/source/rp_nathan_animated_003_walking.fbx'), NATHAN, keep_own='walk')
if not names or 'angler_winter' in names:
    person('angler_winter', os.path.join(SRC, 'rigged-game-character-1/source/tony5_2.fbx'), UE4,
           tex={'Base Color': 'rigged-game-character-1/textures/tony4_tony4_PBR_StoA_Diffuse.png', 'Roughness': 'rigged-game-character-1/textures/tony4_tony4_PBR_StoA_Roughness.png'})
if not names or 'rod' in names: rod()
