# inspect_foliage.py — the Megaplants trees' foliage and bark materials: each instance's parent chain and its parameters (scalar,
# vector, texture, static switches) — what a season (autumn colours, the leaves' fall) could drive. Logs only.
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/inspect_foliage.py
import unreal
reg = unreal.AssetRegistryHelpers.get_asset_registry()
ML = unreal.MaterialEditingLibrary
seen = set()
for a in reg.get_assets_by_path('/Game/Megaplant_Library', recursive=True):
    if str(a.asset_class_path.asset_name) != 'MaterialInstanceConstant': continue
    pkg = str(a.package_name)
    if 'Foliage' not in pkg and 'Bark' not in pkg: continue
    mi = unreal.load_asset(pkg); chain = []; m = mi
    while isinstance(m, unreal.MaterialInstance): m = m.get_editor_property('parent'); chain.append(m.get_path_name() if m else 'None')
    unreal.log_warning('HB fol %s -> %s' % (pkg, ' -> '.join(chain)))
    root = chain[-1] if chain else ''
    if root in seen: continue
    seen.add(root)
    base = unreal.load_asset(root.split('.')[0]) if root and root != 'None' else None
    if base:
        for kind, fn in (('scalar', ML.get_scalar_parameter_names), ('vector', ML.get_vector_parameter_names), ('texture', ML.get_texture_parameter_names), ('switch', ML.get_static_switch_parameter_names)):
            try: unreal.log_warning('HB fol   %s %s: %s' % (root.split('/')[-1], kind, sorted(str(n) for n in fn(base))))
            except Exception as ex: unreal.log_warning('HB fol   %s %s: (%s)' % (root, kind, ex))
