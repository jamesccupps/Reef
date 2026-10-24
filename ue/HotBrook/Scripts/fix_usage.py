# fix_usage.py — every opaque or cut-out surface material we draw marked for use on Nanite meshes and on instanced meshes. A material
# without the flags still draws in the editor (it sets them itself there), but in the game (-game) it draws Unreal's grey default
# instead ("missing usage flag Nanite! Default Material will be used in game") — the lilies' and reeds' (HISM, Nanite), the camps'
# masters (their Nanite pieces), the bullfrog's and the painted turtle's (Nanite).
#   - our own masters (Materials under /Game/HotBrook): the flags set;
#   - the models imported through Interchange (glTF): their material instances' parents are the plugin's (/InterchangeAssets/gltf/…:
#     not ours to change) — each such parent chain copied once into /Game/HotBrook/Interchange with the flags on its root, and our
#     instances re-parented to the copies.
# Logs what it changed. Run after an import (import_creatures.py runs it on what it imported).
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/fix_usage.py
import unreal
L = unreal.MaterialEditingLibrary
EAL = unreal.EditorAssetLibrary
reg = unreal.AssetRegistryHelpers.get_asset_registry()
FLAGS = ('used_with_nanite', 'used_with_instanced_static_meshes')
COPIES = '/Game/HotBrook/Interchange'
fixed = []

def flag(m):
    # (a surface material, opaque or cut-out: its missing flags set, recompiled and saved — the names of those it set)
    if m.get_editor_property('material_domain') != unreal.MaterialDomain.MD_SURFACE: return []
    if m.get_editor_property('blend_mode') not in (unreal.BlendMode.BLEND_OPAQUE, unreal.BlendMode.BLEND_MASKED): return []
    want = [f for f in FLAGS if not m.get_editor_property(f)]
    for f in want: m.set_editor_property(f, True)
    if want: L.recompile_material(m); EAL.save_asset(m.get_path_name())
    return want

def ours(path): return path.startswith('/Game/')

copied = {}   # (a plugin material's path → its copy)
def copy_of(parent):
    # (a plugin material or instance copied into COPIES, its own parents first: the copy's path)
    p = parent.get_path_name().split('.')[0]
    if p in copied: return copied[p]
    name = p.split('/')[-1]; dest = COPIES + '/' + name
    if not EAL.does_asset_exist(dest): EAL.duplicate_asset(p, dest)
    c = unreal.load_asset(dest)
    if isinstance(c, unreal.MaterialInstanceConstant):
        up = c.get_editor_property('parent')
        if up and not ours(up.get_path_name()): L.set_material_instance_parent(c, unreal.load_asset(copy_of(up))); EAL.save_asset(dest, only_if_is_dirty=False)
    elif isinstance(c, unreal.Material):
        w = flag(c)
        if w: fixed.append('%s (copied, %s)' % (dest, ', '.join(w)))
    EAL.save_asset(dest, only_if_is_dirty=False); copied[p] = dest
    return dest

def fix(root):
    for a in reg.get_assets_by_path(root, recursive=True):
        cls = str(a.asset_class_path.asset_name); pkg = str(a.package_name)
        if pkg.startswith(COPIES): continue
        if cls == 'Material':
            w = flag(unreal.load_asset(pkg))
            if w: fixed.append('%s (%s)' % (pkg, ', '.join(w)))
        elif cls == 'MaterialInstanceConstant':
            mi = unreal.load_asset(pkg); up = mi.get_editor_property('parent')
            if up and not ours(up.get_path_name()):
                L.set_material_instance_parent(mi, unreal.load_asset(copy_of(up))); EAL.save_asset(pkg, only_if_is_dirty=False)   # (re-parenting leaves it unmarked)
                fixed.append('%s (re-parented from %s)' % (pkg, up.get_path_name().split('.')[0]))

if __name__ == '__main__':
    fix('/Game/HotBrook')
    for f in fixed: unreal.log_warning('HB usage: ' + f)
    unreal.log_warning('HB usage: %d changes' % len(fixed))
