# make_night_sky_material.py — M_HB_NightSky: the night sky over the lakes, on a great sphere about the camera (AHotBrookNightSky),
# unlit and added over the sky atmosphere (black by night): the STARS — a procedural field, three bands of brightness, fixed on the
# celestial sphere and turned by the sidereal time (the pole 45.63° up in the north: Polaris stays, the rest wheel about it), the
# MILKY WAY along the galactic plane (its pole at RA 192.86°, Dec 27.13°), the faint AIRGLOW and skyglow brightest toward the horizon
# (a dark site: what lets the treeline show against the sky on a moonless night), and the MOON's disc (0.26° across) lit on its sun's
# side by its phase. All but the moon scaled by 'Night' (0 by day). Parameters: Night, LST (radians), MoonDir, SunDir (Unreal's
# directions toward them), MoonGain, StarGain, GlowGain.
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/make_night_sky_material.py
import unreal
L = unreal.MaterialEditingLibrary
EAL = unreal.EditorAssetLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
path = '/Game/HotBrook/Materials/M_HB_NightSky'
bad = []
if EAL.does_asset_exist(path): EAL.delete_asset(path)
m = tools.create_asset('M_HB_NightSky', '/Game/HotBrook/Materials', unreal.Material, unreal.MaterialFactoryNew())
m.set_editor_property('shading_model', unreal.MaterialShadingModel.MSM_UNLIT)
m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_ADDITIVE)
m.set_editor_property('two_sided', True)
for p, v in (('use_translucency_vertex_fog', False), ('allow_negative_emissive_color', False)):   # (no fog: the dome is 50 km off — its stars would drown)
    try: m.set_editor_property(p, v)
    except Exception as ex: bad.append('%s: %s' % (p, ex))
def node(cls, x, y): return L.create_material_expression(m, cls, x, y)
def link(a, ao, b, bi):
    if not L.connect_material_expressions(a, ao, b, bi): bad.append('%s.%s -> %s.%s' % (a.get_name(), ao, b.get_name(), bi))
def scalar(name, v, x, y):
    s = node(unreal.MaterialExpressionScalarParameter, x, y); s.set_editor_property('parameter_name', name); s.set_editor_property('default_value', v); return s
def vec(name, v, x, y):
    s = node(unreal.MaterialExpressionVectorParameter, x, y); s.set_editor_property('parameter_name', name); s.set_editor_property('default_value', unreal.LinearColor(*v)); return s
CODE = r'''
float3 d = normalize(D);
// the celestial frame: the pole P (north, 45.63 deg up), Q the equator's point due south, E east (Unreal: X east, Y south, Z up)
const float lat = 0.79640;
float3 P = float3(0.0, -cos(lat), sin(lat)), Q = float3(0.0, sin(lat), cos(lat)), E = float3(1.0, 0.0, 0.0);
float a = dot(d, Q), b = -dot(d, E), c = dot(d, P);
float cl = cos(LST), sl = sin(LST);
float3 s = float3(cl * a + sl * b, sl * a - cl * b, c);   // (the direction in RA/Dec: fixed to the stars)
float up = d.z, vis = smoothstep(-0.01, 0.04, up);
// the stars: three bands, each a few cells of a 3-D grid on the sphere holding one
float st = 0.0;
for (int o = 0; o < 3; o++) {
  float sc = 90.0 * pow(2.0, (float)o);
  float3 p = s * sc, cc = floor(p), f = frac(p);
  float h = frac(sin(dot(cc, float3(12.9898, 78.233, 37.719))) * 43758.5453);
  float h2 = frac(sin(dot(cc, float3(39.346, 11.135, 83.155))) * 24634.6345);
  float h3 = frac(sin(dot(cc, float3(73.156, 52.235, 9.151))) * 63154.2341);
  float3 at = float3(h2, h3, frac(h * 13.7 + h2 * 3.1)) * 0.6 + 0.2;
  float r = length(f - at);
  float lim = (o == 0) ? 0.978 : ((o == 1) ? 0.966 : 0.952);   // (a dark site: ~2,500 stars to the eye above the horizon)
  st += (h > lim ? 1.0 : 0.0) * exp(-r * r * 900.0 * (1.0 + o)) * pow(h3, 2.0) * (o == 0 ? 3.0 : (o == 1 ? 1.2 : 0.5));
}
// the Milky Way: a soft band along the galactic plane, its clouds and dark rifts a smooth 3-D value noise (two octaves)
float3 G = float3(cos(0.47350) * cos(3.36600), cos(0.47350) * sin(3.36600), sin(0.47350));
float gb = dot(s, G);
float nz = 0.0, amp = 0.65;
for (int k = 0; k < 2; k++) {
  float3 q = s * (k == 0 ? 7.0 : 19.0) + k * 17.3, i0 = floor(q), w = frac(q); w = w * w * (3.0 - 2.0 * w);
  float v000 = frac(sin(dot(i0, float3(12.99, 78.23, 37.72))) * 43758.55), v100 = frac(sin(dot(i0 + float3(1,0,0), float3(12.99, 78.23, 37.72))) * 43758.55);
  float v010 = frac(sin(dot(i0 + float3(0,1,0), float3(12.99, 78.23, 37.72))) * 43758.55), v110 = frac(sin(dot(i0 + float3(1,1,0), float3(12.99, 78.23, 37.72))) * 43758.55);
  float v001 = frac(sin(dot(i0 + float3(0,0,1), float3(12.99, 78.23, 37.72))) * 43758.55), v101 = frac(sin(dot(i0 + float3(1,0,1), float3(12.99, 78.23, 37.72))) * 43758.55);
  float v011 = frac(sin(dot(i0 + float3(0,1,1), float3(12.99, 78.23, 37.72))) * 43758.55), v111 = frac(sin(dot(i0 + float3(1,1,1), float3(12.99, 78.23, 37.72))) * 43758.55);
  float n = lerp(lerp(lerp(v000, v100, w.x), lerp(v010, v110, w.x), w.y), lerp(lerp(v001, v101, w.x), lerp(v011, v111, w.x), w.y), w.z);
  nz += n * amp; amp = 0.35;
}
float rift = smoothstep(0.08, 0.0, abs(gb + 0.06 * (nz - 0.5))) * 0.4 * saturate(nz * 2.2 - 0.5);   // (the Great Rift's dark lanes down the middle, broad and broken)
float mw = exp(-gb * gb * 30.0) * saturate(nz * 1.3 - 0.15) * (1.0 - rift);
// the airglow and the skyglow: faint, brightest at the horizon
float glow = 0.35 + 1.4 * pow(1.0 - saturate(up), 3.0);
float3 col = (st * float3(0.95, 0.97, 1.0) * StarGain + mw * float3(0.75, 0.78, 0.85) * 0.006 * StarGain) * vis + glow * float3(0.35, 0.42, 0.6) * GlowGain * vis;
col *= Night;
// the moon: its disc, lit on its sun's side
float3 md = normalize(MoonDir);
float mc = dot(d, md), R = 0.00454;
float3 u = d - md * mc; float t = length(u) / R;
if (mc > 0.0 && t < 1.0) {
  float3 n = normalize(u / max(length(u), 1e-6) * t - md * sqrt(saturate(1.0 - t * t)));
  float lit = saturate(dot(n, normalize(SunDir)) * 3.0 + 0.05);
  col += float3(0.95, 0.93, 0.88) * lit * MoonGain * smoothstep(1.0, 0.92, t) * smoothstep(-0.02, 0.02, up);
}
return col;
'''
cu = node(unreal.MaterialExpressionCustom, -400, 0)
cu.set_editor_property('code', CODE); cu.set_editor_property('output_type', unreal.CustomMaterialOutputType.CMOT_FLOAT3)
names = ('D', 'LST', 'Night', 'MoonDir', 'SunDir', 'MoonGain', 'StarGain', 'GlowGain')
ins = []
for nm in names:
    ci = unreal.CustomInput(); ci.set_editor_property('input_name', nm); ins.append(ci)
cu.set_editor_property('inputs', ins)
wp = node(unreal.MaterialExpressionWorldPosition, -900, -200); cam = node(unreal.MaterialExpressionCameraPositionWS, -900, -100)
dv = node(unreal.MaterialExpressionSubtract, -750, -150); link(wp, '', dv, 'A'); link(cam, '', dv, 'B')
link(dv, '', cu, 'D')
link(scalar('LST', 0.0, -750, 0), '', cu, 'LST'); link(scalar('Night', 0.0, -750, 80), '', cu, 'Night')
md = vec('MoonDir', (0, 0, 1, 0), -750, 160); sd = vec('SunDir', (0, 0, -1, 0), -750, 260)
mm = node(unreal.MaterialExpressionComponentMask, -600, 160); mm.set_editor_property('r', True); mm.set_editor_property('g', True); mm.set_editor_property('b', True); link(md, '', mm, '')
sm = node(unreal.MaterialExpressionComponentMask, -600, 260); sm.set_editor_property('r', True); sm.set_editor_property('g', True); sm.set_editor_property('b', True); link(sd, '', sm, '')
link(mm, '', cu, 'MoonDir'); link(sm, '', cu, 'SunDir')
link(scalar('MoonGain', 3.0, -750, 360), '', cu, 'MoonGain'); link(scalar('StarGain', 1.4, -750, 440), '', cu, 'StarGain'); link(scalar('GlowGain', 0.004, -750, 520), '', cu, 'GlowGain')
if not L.connect_material_property(cu, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR): bad.append('emissive')
L.recompile_material(m); EAL.save_asset(path, only_if_is_dirty=False)
unreal.log_warning('HB night sky: %s; problems: %s' % (path, bad or 'none'))
