# inspect_animals.py — the imported bear's and moose's poses: which way each faces (its head bone in the reference pose), how far
# its gaits carry it (the root bone's travel over each clip — in place or not), each clip's length: what AHotBrookAnimals needs.
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/inspect_animals.py
import json, os
import unreal
A = unreal.AnimPoseExtensions
man = json.load(open(os.path.join(unreal.Paths.project_dir(), 'Import', 'animals_meshes.json')))
WORLD = unreal.AnimPoseSpaces.WORLD
for name, m in man.items():
    mesh = unreal.load_asset(m['mesh']); skel = mesh.get_editor_property('skeleton')
    ref = A.get_reference_pose(skel); bones = list(A.get_bone_names(ref))
    def where(p, b): return A.get_bone_pose(p, b, WORLD).translation
    head = next((b for b in bones if 'head' in str(b).lower()), None); tail = next((b for b in bones if 'tail' in str(b).lower()), None)
    unreal.log_warning('HB inspect %s: %d bones, root %s; head %s at %s; tail %s at %s' % (name, len(bones), bones[0], head, where(ref, head) if head else '-', tail, where(ref, tail) if tail else '-'))
    for an in m['anims']:
        if name == 'bear' and not any(w in an for w in ('_Walk', '_Trot', '_Run', '_Sprint', 'Stand_Idle_01', 'Stand_Eating', 'Lying_Idle_01', 'Sneak')): continue
        s = unreal.load_asset(os.path.dirname(m['mesh']) + '/' + an)
        L = s.get_play_length()
        p0 = unreal.AnimPose(); p1 = unreal.AnimPose()
        o = unreal.AnimPoseEvaluationOptions()
        try:
            p0 = A.get_anim_pose_at_time(s, 0.0, o); p1 = A.get_anim_pose_at_time(s, L, o)
        except TypeError:
            A.get_anim_pose_at_time(s, 0.0, o, p0); A.get_anim_pose_at_time(s, L, o, p1)
        r0 = where(p0, bones[0]); r1 = where(p1, bones[0])
        rm = s.get_editor_property('enable_root_motion') if hasattr(s, 'enable_root_motion') else '?'
        unreal.log_warning('HB inspect %s %s: %.2f s, root %s -> %s (moved %.0f cm)' % (name, an, L, r0, r1, (r1 - r0).length()))
