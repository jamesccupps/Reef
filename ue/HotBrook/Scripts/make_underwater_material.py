# make_underwater_material.py — the lakes seen from under the surface (/Game/HotBrook/Materials/M_HB_Underwater, a post-process
# material AHotBrookWaterSurface switches on while the camera is under the water). The same water as M_LakeWater's, from inside:
#   - the light that reaches a thing at depth d has crossed d of tea water: × exp(−Kd·d), per colour (blue lost first: the forest's
#     dissolved organic matter — water3.js's KD_TRUE, Kd 0.55/0.75/1.9 per m red/green/blue);
#   - what the eye sees of it has crossed the path L between: × exp(−c·L), c = a + b, M_LakeWater's absorption and scattering
#     (per cm there: 0.0042/0.0062/0.0175 and 0.00035/0.0003/0.00015);
#   - the water's own light fills in what is lost: the daylight that reached the eye's depth (E·exp(−Kd·z), the sun's and the sky's,
#     from the game), scattered toward the eye (× b/c × 1/2π: an isotropic share), brighter looking up toward the sunlit surface
#     (×5) and darker looking down (×0.4) — water3.js's underwater fog colours by gaze — and kept in the scene's exposure.
# Parameters the game sets each frame: SurfaceZ (cm, the surface over the camera), SunLux (the daylight on the surface, the scene's
# units, per colour).
#   UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/make_underwater_material.py
import math
import unreal
L = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
path, name = '/Game/HotBrook/Materials', 'M_HB_Underwater'
if unreal.EditorAssetLibrary.does_asset_exist(path + '/' + name): unreal.EditorAssetLibrary.delete_asset(path + '/' + name)
m = tools.create_asset(name, path, unreal.Material, unreal.MaterialFactoryNew())
m.set_editor_property('material_domain', unreal.MaterialDomain.MD_POST_PROCESS)
for loc in ('BL_SCENE_COLOR_BEFORE_DOF', 'BL_BEFORE_DOF', 'BL_SCENE_COLOR_AFTER_DOF'):
    if hasattr(unreal.BlendableLocation, loc): m.set_editor_property('blendable_location', getattr(unreal.BlendableLocation, loc)); break
bad = []
def node(cls, x, y): return L.create_material_expression(m, cls, x, y)
def link(a, ao, b, bi):
    if not L.connect_material_expressions(a, ao, b, bi): bad.append('%s.%s -> %s.%s' % (a.get_class().get_name(), ao, b.get_class().get_name(), bi))
def op(cls, a, b, x, y, ao='', bo=''):
    n = node(cls, x, y); link(a, ao, n, 'A'); link(b, bo, n, 'B'); return n
def c1(v, x, y): n = node(unreal.MaterialExpressionConstant, x, y); n.set_editor_property('r', v); return n
def vparam(nm, v, x, y): n = node(unreal.MaterialExpressionVectorParameter, x, y); n.set_editor_property('parameter_name', nm); n.set_editor_property('default_value', unreal.LinearColor(v[0], v[1], v[2], 1)); return n
def sparam(nm, v, x, y): n = node(unreal.MaterialExpressionScalarParameter, x, y); n.set_editor_property('parameter_name', nm); n.set_editor_property('default_value', v); return n
def mask(a, ch, x, y):
    n = node(unreal.MaterialExpressionComponentMask, x, y)
    for k in 'rgba': n.set_editor_property(k, k == ch)
    link(a, '', n, ''); return n
def expneg(a, x, y):   # exp(−a)
    neg = op(unreal.MaterialExpressionMultiply, a, c1(-1.0, x - 150, y + 60), x - 100, y)
    if hasattr(unreal, 'MaterialExpressionExponential'): e = node(unreal.MaterialExpressionExponential, x, y); link(neg, '', e, ''); return e
    p = node(unreal.MaterialExpressionPower, x, y); link(c1(math.e, x - 150, y - 60), '', p, 'Base'); link(neg, '', p, 'Exponent'); return p
def smooth(lo, hi, v, x, y):
    s = node(unreal.MaterialExpressionSmoothStep, x, y); link(c1(lo, x - 120, y - 40), '', s, 'Min'); link(c1(hi, x - 120, y + 40), '', s, 'Max'); link(v, '', s, 'Value'); return s
def lerp(a, b, t, x, y):
    n = node(unreal.MaterialExpressionLinearInterpolate, x, y); link(a, '', n, 'A'); link(b, '', n, 'B'); link(t, '', n, 'Alpha'); return n

scene = node(unreal.MaterialExpressionSceneTexture, -2200, -400); scene.set_editor_property('scene_texture_id', unreal.SceneTextureId.PPI_POST_PROCESS_INPUT0)
pix = node(unreal.MaterialExpressionWorldPosition, -2200, 0); cam = node(unreal.MaterialExpressionCameraPositionWS, -2200, 150)
d = op(unreal.MaterialExpressionSubtract, pix, cam, -2000, 50)
ln = node(unreal.MaterialExpressionLength, -1850, 50); link(d, '', ln, '')
Lm = node(unreal.MaterialExpressionMin, -1650, 50); link(op(unreal.MaterialExpressionDivide, ln, c1(100.0, -1800, 120), -1700, 50), '', Lm, 'A'); Lm.set_editor_property('const_b', 300.0)   # (m; the sky: far)
nz = node(unreal.MaterialExpressionNormalize, -1850, 250); link(d, '', nz, ''); dirz = mask(nz, 'b', -1700, 250)
surf = sparam('SurfaceZ', 0.0, -2200, 400)
def below(pz, x, y):   # m under the surface, ≥ 0
    mx = node(unreal.MaterialExpressionMax, x + 150, y); link(op(unreal.MaterialExpressionDivide, op(unreal.MaterialExpressionSubtract, surf, pz, x - 100, y), c1(100.0, x - 100, y + 70), x, y), '', mx, 'A'); mx.set_editor_property('const_b', 0.0); return mx
dpix = below(mask(pix, 'b', -2000, 400), -1800, 400); dcam = below(mask(cam, 'b', -2000, 550), -1800, 550)
kd = vparam('Kd', (0.55, 0.75, 1.9), -1600, 700)
ext = vparam('Extinction', (0.455, 0.65, 1.765), -1600, 850)
sca = vparam('Scatter', (0.035, 0.03, 0.015), -1600, 1000)
sun = vparam('SunLux', (10.0, 10.0, 10.0), -1600, 1150)
down = expneg(op(unreal.MaterialExpressionMultiply, kd, dpix, -1400, 400), -1150, 400)       # (the light that reached the thing)
T = expneg(op(unreal.MaterialExpressionMultiply, ext, Lm, -1400, 100), -1150, 100)           # (what of it crosses the path to the eye)
Ez = op(unreal.MaterialExpressionMultiply, sun, expneg(op(unreal.MaterialExpressionMultiply, kd, dcam, -1400, 600), -1150, 600), -950, 650)
gaze = lerp(lerp(c1(0.4, -1300, 250), c1(1.0, -1300, 300), smooth(-0.75, 0.05, dirz, -1400, 250), -1150, 250), c1(5.0, -1150, 330), smooth(0.15, 0.85, dirz, -1400, 330), -950, 280)
share = op(unreal.MaterialExpressionMultiply, op(unreal.MaterialExpressionDivide, sca, ext, -1400, 950), c1(0.5 / math.pi, -1400, 1050), -1200, 950)
eye = node(unreal.MaterialExpressionEyeAdaptation, -1000, 1100)
fog = op(unreal.MaterialExpressionMultiply, op(unreal.MaterialExpressionMultiply, op(unreal.MaterialExpressionMultiply, Ez, share, -800, 800), gaze, -650, 600), eye, -500, 700)
rgb = node(unreal.MaterialExpressionComponentMask, -2000, -400)
for k in 'rgba': rgb.set_editor_property(k, k != 'a')
link(scene, 'Color', rgb, '')   # (the scene's colour, RGB)
seen = op(unreal.MaterialExpressionMultiply, op(unreal.MaterialExpressionMultiply, rgb, down, -900, -300), T, -700, -200)
omt = node(unreal.MaterialExpressionOneMinus, -900, 100); link(T, '', omt, '')
res = op(unreal.MaterialExpressionAdd, seen, op(unreal.MaterialExpressionMultiply, fog, omt, -450, 300), -250, 0)
if not L.connect_material_property(res, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR): bad.append('-> emissive')
L.recompile_material(m); unreal.EditorAssetLibrary.save_asset(path + '/' + name)
unreal.log_warning('HB underwater material: %s' % ('ok' if not bad else 'PROBLEMS ' + '; '.join(bad)))
