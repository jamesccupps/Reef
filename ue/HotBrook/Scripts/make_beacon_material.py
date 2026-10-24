# make_beacon_material.py — M_HB_Beacon: an unlit glowing colour (its 'Color' × 'Glow'), for the wind turbines' red aviation beacons
# (AHotBrookTurbines flashes them by night: 'Glow' up and down, all of them together).
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/make_beacon_material.py
import unreal
L = unreal.MaterialEditingLibrary
EAL = unreal.EditorAssetLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
path = '/Game/HotBrook/Landmarks/M_HB_Beacon'
if EAL.does_asset_exist(path): EAL.delete_asset(path)
m = tools.create_asset('M_HB_Beacon', '/Game/HotBrook/Landmarks', unreal.Material, unreal.MaterialFactoryNew())
m.set_editor_property('shading_model', unreal.MaterialShadingModel.MSM_UNLIT)
for f in ('used_with_nanite', 'used_with_instanced_static_meshes'): m.set_editor_property(f, True)
c = L.create_material_expression(m, unreal.MaterialExpressionVectorParameter, -500, 0); c.set_editor_property('parameter_name', 'Color'); c.set_editor_property('default_value', unreal.LinearColor(1.0, 0.02, 0.01, 1))
g = L.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -500, 200); g.set_editor_property('parameter_name', 'Glow'); g.set_editor_property('default_value', 0.0)
mul = L.create_material_expression(m, unreal.MaterialExpressionMultiply, -250, 100)
ok = L.connect_material_expressions(c, '', mul, 'A') and L.connect_material_expressions(g, '', mul, 'B') and L.connect_material_property(mul, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
L.recompile_material(m); EAL.save_asset(path, only_if_is_dirty=False)
unreal.log_warning('HB beacon: %s (%s)' % (path, 'ok' if ok else 'a link failed'))
