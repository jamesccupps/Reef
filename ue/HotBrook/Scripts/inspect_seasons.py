# inspect_seasons.py — how a Megaplants foliage instance is recoloured: the overrides (scalar, vector, static switch) of the heather's
# own 'Dead' and 'Pink' variants and of a few trees' foliage — the parameters that turn a leaf another colour. Logs only.
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/inspect_seasons.py
import unreal
for p in ('/Game/Megaplant_Library/Shrub_Heather/Materials/MI_Heather_01_Foliage', '/Game/Megaplant_Library/Shrub_Heather/Materials/MI_Heather_01_Foliage_Dead',
          '/Game/Megaplant_Library/Shrub_Heather/Materials/MI_Heather_01_Foliage_Pink', '/Game/Megaplant_Library/Tree_Norway_Maple/Materials/MI_Norway_Maple_Foliage_01',
          '/Game/Megaplant_Library/Tree_Silver_Birch/Materials/MI_Silver_Birch_01_Foliage', '/Game/HotBrook/Seasons/MI_Norway_Maple_Foliage_01_Season'):
    mi = unreal.load_asset(p)
    if not mi: continue
    out = []
    for v in mi.get_editor_property('scalar_parameter_values'): out.append('%s=%.3f' % (v.get_editor_property('parameter_info').get_editor_property('name'), v.get_editor_property('parameter_value')))
    for v in mi.get_editor_property('vector_parameter_values'):
        c = v.get_editor_property('parameter_value'); out.append('%s=(%.2f,%.2f,%.2f,%.2f)' % (v.get_editor_property('parameter_info').get_editor_property('name'), c.r, c.g, c.b, c.a))
    try:
        sp = mi.get_editor_property('static_parameters')
        for v in sp.get_editor_property('static_switch_parameters'):
            if v.get_editor_property('override'): out.append('switch %s=%s' % (v.get_editor_property('parameter_info').get_editor_property('name'), v.get_editor_property('value')))
    except Exception as ex: out.append('(switches: %s)' % ex)
    unreal.log_warning('HB ss %s: %s' % (p.split('/')[-1], '; '.join(out)))
