# inspect_usage.py — prints a few materials' parent chains and their roots' usage flags (a check on fix_usage.py)
import unreal
for p in ('/Game/HotBrook/Creatures/bullfrog/bullfrog/Materials/material_0_001', '/Game/HotBrook/Plants/lake_lily/lake_lily/Materials/LilyPad_01_Mat', '/Game/HotBrook/Interchange/M_Default'):
    m = unreal.load_asset(p); chain = []
    while m is not None:
        chain.append(m.get_path_name())
        if isinstance(m, unreal.MaterialInstance): m = m.get_editor_property('parent')
        else:
            chain.append('nanite %s ism %s domain %s blend %s' % (m.get_editor_property('used_with_nanite'), m.get_editor_property('used_with_instanced_static_meshes'), m.get_editor_property('material_domain'), m.get_editor_property('blend_mode'))); break
    unreal.log_warning('HB chain: ' + ' -> '.join(chain))
