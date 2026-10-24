# fix_megaplants.py — mends the Megaplants packs' material instances whose textures point outside the pack (Fab's Baltic Pine bark
# instance references its bark maps in a developer's folder, /Game/Developers/…, and in the Aleppo Pine pack, neither shipped): each
# texture parameter left empty is pointed at the pack's own texture of the same name, or, for another pack's, the pack's bark of the
# same map (…_C colour, …_NAH normal/AO/height). Logs what it changed; run after adding packs.
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/fix_megaplants.py
import re
import unreal
L = unreal.MaterialEditingLibrary
EAL = unreal.EditorAssetLibrary
reg = unreal.AssetRegistryHelpers.get_asset_registry()
ROOT = '/Game/Megaplant_Library'
fixed = []
for a in reg.get_assets_by_path(ROOT, recursive=True):
    if str(a.asset_class_path.asset_name) != 'MaterialInstanceConstant': continue
    pkg = str(a.package_name)
    deps = [str(d) for d in reg.get_dependencies(pkg, unreal.AssetRegistryDependencyOptions()) or []]
    missing = [d for d in deps if d.startswith('/Game/') and not EAL.does_asset_exist(d)]
    if not missing: continue
    pack = '/'.join(pkg.split('/')[:4])   # (/Game/Megaplant_Library/Tree_X)
    own = {str(t.asset_name): '%s.%s' % (t.package_name, t.asset_name) for t in reg.get_assets_by_path(pack + '/Textures', recursive=False)}
    mi = unreal.load_asset(pkg)
    # the overrides left empty (their texture didn't load), in order, matched to the missing textures of the same map: a colour
    # parameter to a _C, a normal to a _NAH — the pack's own texture of that name, else the pack's bark of that map
    for tp in mi.get_editor_property('texture_parameter_values'):
        if tp.get_editor_property('parameter_value'): continue
        p = str(tp.get_editor_property('parameter_info').get_editor_property('name'))
        want = '_NAH' if 'Normal' in p else '_C'
        d = next((d for d in missing if d.endswith(want)), None)
        if not d: continue
        name = d.split('/')[-1]
        pick = own.get(name) or next((v for k, v in sorted(own.items()) if k.endswith(want) and 'Bark' in k), None)
        if pick:
            L.set_material_instance_texture_parameter_value(mi, p, unreal.load_asset(pick)); fixed.append('%s.%s <- %s (was %s)' % (pkg.split('/')[-1], p, pick.split('.')[-1], name))
            missing.remove(d)
    EAL.save_asset(pkg)
    unreal.log_warning('HB megaplants missing refs in %s: %s' % (pkg, missing or 'all mended'))
for f in fixed: unreal.log_warning('HB megaplants fixed ' + f)
unreal.log_warning('HB megaplants: %d parameters mended' % len(fixed))
