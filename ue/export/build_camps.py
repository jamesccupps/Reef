# build_camps.py — THE CAMPS' BUILDINGS AND DOCKS AS MESHES FOR UNREAL (Python 3, numpy): from Import/camps.json (export_camps.mjs —
# the browser's layout of the verified dataset), each building and each dock built true size from its parts and written as a .glb
# for Scripts/import_camps.py:
#   - A BUILDING (local metres from its anchor — its body's centre — x east, y north, z up; its floor at z 0, which AHotBrookCamps sets
#     on the ground: over the highest corner, at most 2.6 m over the lowest): a foundation down into the ground; the walls in their
#     siding (lap boards, vertical boards, logs — a trailer's metal) with corner boards and a water table; a gable roof along the
#     longer side with its overhangs, fascia, soffits and ridge cap, in painted steel or asphalt shingles (a shed's low single slope);
#     its gable ends; windows with frames, sills, muntins and, on some painted camps, shutters — bigger on the water side, a slider to
#     the deck; the door with its frame, a landing and steps; a porch roof on posts over the door at some; the deck on the water side
#     with its boards, rim, posts and a railing with pickets and a stair; a brick or stone chimney or a stove pipe; a house's second
#     row of windows, a garage's overhead door; the trailers' boxes with their stripe, skirting and windows.
#   - A DOCK (local metres from where it meets the water, x out along it, y across; its deck's top at z 0, which AHotBrookCamps sets
#     ~0.35 m over the lake): its boards across on stringers, its posts down into the bed (wood), or an aluminium frame on legs with
#     grey decking, an L or a T at its end; it runs 1.5 m back onto the bank.
# Each part's material is named for its kind (Siding_lap, Roof_metal, Trim, Glass, Door, Deck, …: import_camps.py gives each a material
# with its texture) and carries its colour in the vertex colours (linear): a paintable surface its paint, a natural one a tint about
# white. UVs are in metres along the surface (the material scales them by its texture's real size): siding and shingles along the
# wall or the eaves, boards along their length, a roof's v down its slope.
# Writes Import/camps/<id>.glb, Import/camps/dock_<j>.glb and Import/camps/camps_parts.json (each mesh's anchor, the ground probes,
# a dock's waterline). Deterministic (cosmetic choices by a hash of the id).
#   python -I ue/export/build_camps.py [Import dir]
import hashlib, json, math, os, struct, sys
import numpy as np

IMP = sys.argv[1] if len(sys.argv) > 1 else 'G:/HotBrookUE/Import'
OUT = os.path.join(IMP, 'camps'); os.makedirs(OUT, exist_ok=True)
J = json.load(open(os.path.join(IMP, 'camps.json'), encoding='utf-8'))

def hh(s, k):   # a stable hash in [0, 1)
    return int(hashlib.sha1(f'{s}:{k}'.encode()).hexdigest()[:8], 16) / 2 ** 32
def lin(h):     # '#rrggbb' (sRGB) -> linear rgb
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return np.array([x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c])
def tint(h, mid, lo=0.65, hi=1.35):   # a natural material's tint: its brightness against the texture's own (mid), a little of its hue
    lum = lambda c: float(np.dot(c, (0.2126, 0.7152, 0.0722)))
    a, b = lin(h), lin(mid); k = float(np.clip(lum(a) / max(lum(b), 1e-4), lo, hi))
    hue = (a / max(lum(a), 1e-4)) / (b / max(lum(b), 1e-4))
    return k * (0.8 + 0.2 * np.clip(hue, 0.6, 1.5))
WHITE = np.ones(3)
X, Y, Z = np.array([1., 0, 0]), np.array([0., 1, 0]), np.array([0., 0, 1])
def v3(x, y, z=0.0): return np.array([x, y, z], float)
def unit(v): v = np.asarray(v, float); return v / (np.linalg.norm(v) or 1)

class Mesh:
    def __init__(s): s.P = {}
    def poly(s, mat, pts, n, tu, tv, col):
        pts = [np.asarray(p, float) for p in pts]; n = unit(n)
        if np.dot(np.cross(pts[1] - pts[0], pts[2] - pts[0]), n) < 0: pts = pts[::-1]
        L = s.P.setdefault(mat, ([], [], [], [], [])); b = len(L[0])
        for p in pts: L[0].append(p); L[1].append(n); L[2].append((float(np.dot(p, tu)), float(np.dot(p, tv)))); L[3].append(col)
        for k in range(1, len(pts) - 1): L[4].extend((b, b + k, b + k + 1))
    def obox(s, mat, c, u, hu, hv, z0, z1, col, skip='', top_tu=None):
        # an oriented box: centre c (x, y), its u axis u (unit, horizontal), half sizes hu (along u) and hv, from z0 to z1; skip faces
        # 'u','U' (−u, +u), 'v','V', 'b' (bottom), 't' (top); its top's texture u along top_tu (else u)
        U = v3(u[0], u[1]); V = v3(-u[1], u[0]); C = v3(c[0], c[1])
        P = lambda a, b, z: C + U * a * hu + V * b * hv + Z * z
        if 'U' not in skip: s.poly(mat, [P(1, -1, z0), P(1, 1, z0), P(1, 1, z1), P(1, -1, z1)], U, V, -Z, col)
        if 'u' not in skip: s.poly(mat, [P(-1, -1, z0), P(-1, 1, z0), P(-1, 1, z1), P(-1, -1, z1)], -U, -V, -Z, col)
        if 'V' not in skip: s.poly(mat, [P(-1, 1, z0), P(1, 1, z0), P(1, 1, z1), P(-1, 1, z1)], V, -U, -Z, col)
        if 'v' not in skip: s.poly(mat, [P(-1, -1, z0), P(1, -1, z0), P(1, -1, z1), P(-1, -1, z1)], -V, U, -Z, col)
        tu = U if top_tu is None else v3(*top_tu[:2]); tv = np.cross(Z, tu)
        if 't' not in skip: s.poly(mat, [P(-1, -1, z1), P(1, -1, z1), P(1, 1, z1), P(-1, 1, z1)], Z, tu, tv, col)
        if 'b' not in skip: s.poly(mat, [P(-1, -1, z0), P(1, -1, z0), P(1, 1, z0), P(-1, 1, z0)], -Z, tu, tv, col)
    def seg(s, mat, a, b, w, h, col, up=Z):
        # a beam of w × h (across × up) from a to b (3-D): rails, rafters
        a, b = np.asarray(a, float), np.asarray(b, float); d = unit(b - a); side = unit(np.cross(up, d)); upn = unit(np.cross(d, side))
        q = [a + side * sx * w / 2 + upn * sy * h / 2 for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
        r = [p + (b - a) for p in q]
        for k in range(4):
            n = unit((q[k] + q[(k + 1) % 4]) / 2 - a)
            s.poly(mat, [q[k], q[(k + 1) % 4], r[(k + 1) % 4], r[k]], n, d, unit(np.cross(n, d)), col)
        s.poly(mat, q, -d, side, upn, col); s.poly(mat, r, d, side, upn, col)
    def cyl(s, mat, c, r, z0, z1, col, n=10):
        for k in range(n):
            a0, a1 = 2 * math.pi * k / n, 2 * math.pi * (k + 1) / n
            p0, p1 = v3(c[0] + r * math.cos(a0), c[1] + r * math.sin(a0)), v3(c[0] + r * math.cos(a1), c[1] + r * math.sin(a1))
            nn = v3(math.cos((a0 + a1) / 2), math.sin((a0 + a1) / 2)); t = np.cross(Z, nn)
            s.poly(mat, [p0 + Z * z0, p1 + Z * z0, p1 + Z * z1, p0 + Z * z1], nn, t, -Z, col)
        s.poly(mat, [v3(c[0] + r * math.cos(2 * math.pi * k / n), c[1] + r * math.sin(2 * math.pi * k / n), z1) for k in range(n)], Z, X, Y, col)
    def count(s): return sum(len(L[4]) // 3 for L in s.P.values())

def write_glb(path, name, M):
    bins = bytearray(); views, accs, prims, mats = [], [], [], []
    def acc(arr, typ, comp, target, mm=False):
        off = len(bins); data = arr.tobytes(); bins.extend(data)
        while len(bins) % 4: bins.append(0)
        views.append({'buffer': 0, 'byteOffset': off, 'byteLength': len(data), 'target': target})
        a = {'bufferView': len(views) - 1, 'componentType': comp, 'count': int(len(arr)), 'type': typ}
        if mm: a['min'] = [float(v) for v in arr.min(0)]; a['max'] = [float(v) for v in arr.max(0)]
        accs.append(a); return len(accs) - 1
    for mat, (P, N, UV, C, I) in sorted(M.P.items()):
        P = np.array(P, np.float32); N = np.array(N, np.float32)
        G = np.ascontiguousarray(np.stack([P[:, 0], P[:, 2], -P[:, 1]], 1), np.float32)   # (glTF: y up, z toward the viewer)
        GN = np.ascontiguousarray(np.stack([N[:, 0], N[:, 2], -N[:, 1]], 1), np.float32)
        Cc = np.ascontiguousarray(np.concatenate([np.array(C, np.float32), np.ones((len(C), 1), np.float32)], 1))
        prims.append({'attributes': {'POSITION': acc(G, 'VEC3', 5126, 34962, True), 'NORMAL': acc(GN, 'VEC3', 5126, 34962),
                                     'TEXCOORD_0': acc(np.array(UV, np.float32), 'VEC2', 5126, 34962), 'COLOR_0': acc(Cc, 'VEC4', 5126, 34962)},
                      'indices': acc(np.array(I, np.uint32), 'SCALAR', 5125, 34963), 'material': len(mats)})
        mats.append({'name': mat, 'pbrMetallicRoughness': {'baseColorFactor': [1, 1, 1, 1], 'metallicFactor': 0.0, 'roughnessFactor': 0.8}})
    gl = {'asset': {'version': '2.0', 'generator': 'synapse-reef ue/export/build_camps.py'}, 'scene': 0, 'scenes': [{'nodes': [0]}],
          'nodes': [{'name': name, 'mesh': 0}], 'meshes': [{'name': name, 'primitives': prims}], 'materials': mats,
          'buffers': [{'byteLength': len(bins)}], 'bufferViews': views, 'accessors': accs}
    js = json.dumps(gl, separators=(',', ':')).encode()
    while len(js) % 4: js += b' '
    with open(path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bins)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A)); f.write(js)
        f.write(struct.pack('<II', len(bins), 0x004E4942)); f.write(bytes(bins))

# ---------- a building ----------
def wall_frame(w, A):   # a wall from the export ([nx, ny, cx, cy, tx, ty, half-length]) in local metres: n, centre, t, half
    return v3(w[0], w[1]), v3(w[2] - A[0], w[3] - A[1]), v3(w[4], w[5]), w[6]

def window(M, n, c, t, s, zc, ww, wh, B, col_trim, shut=None, slider=False):
    # glass a hair proud of the siding; a frame of trim boards about it, a sill below, a drip cap above; muntins; shutters beside it
    p = c + t * s + n * 0.012
    q = lambda a, z, d=0.0: p + t * a + Z * z + n * d
    hw, hh_ = ww / 2, wh / 2
    M.poly('Glass', [q(-hw, zc - hh_), q(hw, zc - hh_), q(hw, zc + hh_), q(-hw, zc + hh_)], n, t, -Z, WHITE)
    fw, fd = 0.09, 0.035
    for a0, a1, z0, z1 in ((-hw - fw, -hw, zc - hh_, zc + hh_), (hw, hw + fw, zc - hh_, zc + hh_), (-hw - fw, hw + fw, zc + hh_, zc + hh_ + fw)):
        M.obox('Trim', (q((a0 + a1) / 2, 0)[0], q((a0 + a1) / 2, 0)[1]), (t[0], t[1]), (a1 - a0) / 2, fd / 2, z0, z1, col_trim)
    sill = q(0, 0, 0.02); M.obox('Trim', (sill[0], sill[1]), (t[0], t[1]), hw + fw + 0.04, 0.045, zc - hh_ - 0.05, zc - hh_, col_trim)
    cap = q(0, 0, 0.02); M.obox('Trim', (cap[0], cap[1]), (t[0], t[1]), hw + fw + 0.02, 0.04, zc + hh_ + fw, zc + hh_ + fw + 0.03, col_trim)
    mw = 0.035
    if slider:   # a sliding glass door: its two panels' frames
        m = q(0, 0, 0.01); M.obox('Trim', (m[0], m[1]), (t[0], t[1]), 0.04, 0.02, zc - hh_, zc + hh_, col_trim)
    else:
        if ww > 1.1:   # a pair of sashes side by side
            m = q(0, 0, 0.008); M.obox('Trim', (m[0], m[1]), (t[0], t[1]), mw, 0.012, zc - hh_, zc + hh_, col_trim)
        if wh > 0.8:   # a double-hung window's meeting rail
            m = q(0, 0, 0.008); M.obox('Trim', (m[0], m[1]), (t[0], t[1]), hw, 0.012, zc - mw, zc + mw, col_trim)
    if shut is not None:
        for sg in (-1, 1):
            m = q(sg * (hw + fw + 0.04 + ww * 0.22), 0, 0.015)
            M.obox('Door', (m[0], m[1]), (t[0], t[1]), ww * 0.22, 0.015, zc - hh_, zc + hh_, shut)

def steps(M, n, c, t, s, z_top, width, col, n_steps=4):
    # a landing at the door's foot and steps down, each a block down into the ground (however far the ground falls away)
    for k in range(n_steps + 1):
        d0 = 0.0 if k == 0 else 0.9 + 0.28 * (k - 1); d1 = 0.9 if k == 0 else d0 + 0.28
        m = c + t * s + n * (d0 + d1) / 2
        M.obox('Deck', (m[0], m[1]), (t[0], t[1]), width / 2, (d1 - d0) / 2, -3.0, z_top - 0.2 * k, col, skip='b', top_tu=(t[0], t[1]))

def gable_roof(M, o, A, B, wallTop, OH, rise, mat, col_roof, col_trim, chim, col_found):
    cx, cy, a, hw, hl = o; C = v3(cx - A[0], cy - A[1]); u = v3(math.cos(a), math.sin(a)); v = v3(-math.sin(a), math.cos(a))
    ridgeV = hl >= hw; r, sx = (v, u) if ridgeV else (u, v); span, lng = (hw, hl) if ridgeV else (hl, hw)
    RO = 0.35; T = 0.12 if mat == 'Roof_shingle' else 0.09
    z_r = wallTop + 0.1 + rise; slope = rise / span
    z_at = lambda q: wallTop + 0.1 + rise - slope * abs(q)
    ze = z_at(span + OH)
    for sg in (-1, 1):
        e = C + sx * sg * (span + OH); m = C
        P = [e - r * (lng + RO) + Z * ze, e + r * (lng + RO) + Z * ze, m + r * (lng + RO) + Z * z_r, m - r * (lng + RO) + Z * z_r]
        down = unit((e + Z * ze) - (m + Z * z_r)); n = unit(np.cross(down, r) if np.dot(np.cross(down, r), Z) > 0 else np.cross(r, down))
        M.poly(mat, P, n, r, down, col_roof)
        Pb = [p - Z * T / max(n[2], 0.3) for p in P]   # (the underside: the soffit and the rafters' line)
        M.poly('Trim', Pb, -n, r, down, col_trim)
        M.poly('Trim', [P[0], P[1], Pb[1], Pb[0]], sx * sg, r, -Z, col_trim)                     # (the fascia at the eaves)
        for re in (-1, 1):                                                                         # (the rake boards up the gables)
            k0, k1 = (0, 3) if re < 0 else (1, 2)
            M.poly('Trim', [P[k0], P[k1], Pb[k1], Pb[k0]], r * re, down, -Z, col_trim)
    # the ridge cap
    M.seg(mat, C - r * (lng + RO) + Z * (z_r + 0.02), C + r * (lng + RO) + Z * (z_r + 0.02), 0.28, 0.06, col_roof)
    # the gable ends: siding triangles from the walls' top to the roof's underside
    for sg in (-1, 1):
        g = C + r * sg * lng
        M.poly(B['_siding'], [g - sx * span + Z * wallTop, g + sx * span + Z * wallTop, g + Z * (z_r - T - 0.02)], r * sg, sx * -sg, -Z, B['_wallc'])
    # the chimney through the ridge near one end, or a stove's pipe through a slope
    if chim:
        al = B['chimSide'] * lng * 0.55
        if chim == 'mason':
            p = C + r * al; m = 'Brick' if B['chimMat'] == 'brick' else 'Stone'
            M.obox(m, (p[0], p[1]), (r[0], r[1]), 0.36, 0.36, wallTop - 0.4, z_r + 0.95, WHITE, skip='b')
            M.obox('Foundation_block', (p[0], p[1]), (r[0], r[1]), 0.42, 0.42, z_r + 0.95, z_r + 1.03, col_found)
        else:
            ac = span * 0.4 * B['chimSide']; p = C + r * al * 0.6 + sx * ac; zt = z_at(span * 0.4)
            M.cyl('PipeMetal', (p[0], p[1]), 0.09, zt - 0.3, zt + 1.25, WHITE)
            M.obox('PipeMetal', (p[0], p[1]), (r[0], r[1]), 0.16, 0.16, zt + 1.3, zt + 1.34, WHITE)
            M.cyl('PipeMetal', (p[0], p[1]), 0.05, zt + 1.25, zt + 1.3, WHITE, n=8)
    return r, sx, span, lng, z_r

def body_walls(M, o, A, H, B):
    cx, cy, a, hw, hl = o; c = (cx - A[0], cy - A[1]); u = (math.cos(a), math.sin(a))
    M.obox(B['_siding'], c, u, hw, hl, 0.0, H, B['_wallc'], skip='tb')
    found = 'Foundation_block' if B['foundMat'] == 'block' else 'Foundation_stone'
    M.obox(found, c, u, hw - 0.05, hl - 0.05, -3.0, 0.02, B['_foundc'], skip='tb')
    # the water table at the sill and the corner boards
    M.obox('Trim', c, u, hw + 0.02, hl + 0.02, 0.0, 0.16, B['_trimc'], skip='tb')
    U = v3(*u); V = v3(-u[1], u[0]); C = v3(*c)
    for i in (-1, 1):
        for j in (-1, 1):
            k = C + U * i * hw + V * j * hl
            M.obox('Trim', (k[0] - U[0] * i * 0.055 + V[0] * j * 0.012, k[1] - U[1] * i * 0.055 + V[1] * j * 0.012), u, 0.055, 0.016, 0.0, H, B['_trimc'])
            M.obox('Trim', (k[0] + U[0] * i * 0.012 - V[0] * j * 0.055, k[1] + U[1] * i * 0.012 - V[1] * j * 0.055), u, 0.016, 0.055, 0.0, H, B['_trimc'])

def deck(M, B, A, o_body):
    d = B['deck']; cx, cy, a, hw, hl = d; c = v3(cx - A[0], cy - A[1]); u = v3(math.cos(a), math.sin(a)); v = v3(-math.sin(a), math.cos(a))
    top = -0.12; col = B['_deckc']; colp = col * 0.85
    wb = B['walls'][B['wside']]; nb = v3(wb[0], wb[1])
    # the boards run along the building's wall (across the way out)
    along = v if abs(np.dot(u, nb)) > 0.7 else u
    M.obox('Deck', (c[0], c[1]), (u[0], u[1]), hw, hl, top - 0.04, top, col, top_tu=(along[0], along[1]))
    M.obox('Deck', (c[0], c[1]), (u[0], u[1]), hw - 0.02, hl - 0.02, top - 0.27, top - 0.04, colp, skip='t')   # (the rim joists)
    sides = []
    for k, (n, h_, t, h2) in enumerate(((u, hw, v, hl), (-u, hw, -v, hl), (v, hl, -u, hw), (-v, hl, u, hw))):
        if np.dot(n, nb) < -0.9: continue   # (the side against the building)
        sides.append((n, h_, t, h2))
        # posts down into the ground along the side, every ≤ 2.4 m
        npost = max(1, int(math.ceil(2 * h2 / 2.4)))
        for q in range(npost + 1):
            p = c + n * (h_ - 0.08) + t * (-h2 + 0.08 + (2 * h2 - 0.16) * q / npost)
            M.obox('Deck', (p[0], p[1]), (u[0], u[1]), 0.07, 0.07, -3.0, top - 0.25, colp, skip='b')
    # the railing round its open sides: posts, a top and a bottom rail, pickets; a gap and a stair on the water side
    for n, h_, t, h2 in sides:
        stair = np.dot(n, nb) > 0.9 and h2 > 1.2
        base = c + n * (h_ - 0.05)
        cuts = [(-0.6, 0.6)] if stair else []
        def runs():
            s0 = -h2 + 0.03
            for a0, a1 in cuts: yield s0, a0; s0 = a1
            yield s0, h2 - 0.03
        for s0, s1 in runs():
            if s1 - s0 < 0.1: continue
            npo = max(1, int(math.ceil((s1 - s0) / 1.8)))
            for q in range(npo + 1):
                p = base + t * (s0 + (s1 - s0) * q / npo); M.obox('Deck', (p[0], p[1]), (u[0], u[1]), 0.045, 0.045, top, top + 0.98, colp, skip='b')
            M.seg('Deck', base + t * s0 + Z * (top + 0.94), base + t * s1 + Z * (top + 0.94), 0.11, 0.04, colp)
            M.seg('Deck', base + t * s0 + Z * (top + 0.12), base + t * s1 + Z * (top + 0.12), 0.06, 0.06, colp)
            npk = int((s1 - s0) / 0.14)
            for q in range(1, npk):
                p = base + t * (s0 + (s1 - s0) * q / npk); M.obox('Deck', (p[0], p[1]), (t[0], t[1]), 0.019, 0.019, top + 0.15, top + 0.92, colp, skip='tb')
        if stair: steps(M, n, c + n * h_, t, 0.0, top + 0.0, 1.1, colp, n_steps=4)

def porch(M, B, A, H, n, c, t, s):
    # a small roof on two posts over the door and its landing
    W2, D = 1.1, 1.35; z0 = 2.45; col = B['_roofc']; roofm = 'Roof_metal' if B['roofMat'] == 'metal' else 'Roof_shingle'
    p = c + t * s
    e0, e1 = p + n * 0.0, p + n * D
    P = [e0 - t * W2 + Z * (z0 + 0.35), e0 + t * W2 + Z * (z0 + 0.35), e1 + t * W2 + Z * z0, e1 - t * W2 + Z * z0]
    nn = unit(np.cross(P[1] - P[0], P[3] - P[0])); nn = nn if nn[2] > 0 else -nn
    M.poly(roofm, P, nn, t, unit(P[3] - P[0]), col)
    M.poly('Trim', [q - Z * 0.08 for q in P], -nn, t, unit(P[3] - P[0]), B['_trimc'])
    M.poly('Trim', [P[2], P[3], P[3] - Z * 0.08, P[2] - Z * 0.08], n, t, -Z, B['_trimc'])
    for sg in (-1, 1):
        q = p + n * (D - 0.12) + t * sg * (W2 - 0.12)
        M.obox('Trim', (q[0], q[1]), (t[0], t[1]), 0.06, 0.06, -3.0, z0, B['_trimc'], skip='b')

def building(B):
    M = Mesh(); A = B['anchor']; typ = B['type']; H = B['H']
    B['_wallc'] = tint(B['wall'], '#6e5a44', 0.55, 1.6) if B['siding'] == 'log' else lin(B['wall'])
    B['_siding'] = {'lap': 'Siding_lap', 'board': 'Siding_board', 'log': 'Siding_log', 'trailer': 'Siding_trailer'}[B['siding']]
    B['_trimc'] = lin(B['trim']); B['_foundc'] = tint(B['found'], '#8a867e'); B['_deckc'] = tint(B['deckC'], '#8a7458')
    B['_roofc'] = lin(B['roof']) if B['roofMat'] == 'metal' else tint(B['roof'], '#3a3c40', 0.7, 2.2)
    roofm = 'Roof_metal' if B['roofMat'] == 'metal' else 'Roof_shingle'
    shut = lin(B['door']) if B['shutters'] else None
    # the trailers: a box on blocks with its stripe, a low roof, windows down the long sides and a door on the land side
    for ui, U in enumerate(B['units']):
        cx, cy, a, hw, hl = U; c = (cx - A[0], cy - A[1]); u = (math.cos(a), math.sin(a)); Hh = 2.75 if typ == 'trailer' else 2.6
        wc = lin(B['wall']) if typ == 'trailer' else lin('#e8e4d6')
        M.obox('Siding_trailer', c, u, hw, hl, 0.0, Hh, wc, skip='tb')
        M.obox('Foundation_block', c, u, hw - 0.1, hl - 0.15, -3.0, 0.02, tint('#4a4640', '#8a867e', 0.4, 1.0), skip='tb')
        stripe = lin('#7a3a2a') if B['ci'] % 2 else lin('#3a5a7a')
        M.obox('Trim', c, u, hw + 0.012, hl + 0.012, 1.95, 2.12, stripe, skip='tb')
        M.obox('Roof_metal', c, u, hw + 0.06, hl + 0.06, Hh, Hh + 0.1, lin('#d8d8d2'))
        # (the export lays each trailer's long sides on its ±u walls: hl >= hw)
        Wu = [(v3(math.cos(a), math.sin(a)), hw, v3(-math.sin(a), math.cos(a)), hl), (-v3(math.cos(a), math.sin(a)), hw, -v3(-math.sin(a), math.cos(a)), hl)]
        for k, (n, h_, t, h2) in enumerate(Wu):
            cw = v3(*c) + n * h_
            dside = ui == 0 and k == (0 if hh(B['id'], 40) < 0.5 else 1)
            sd = h2 * 0.35 if dside else None
            for f in (-0.6, 0.0, 0.6):
                if sd is not None and abs(f * h2 - sd) < 1.2: continue
                window(M, n, cw, t, f * h2, 1.45, 0.9, 0.65, B, B['_trimc'])
            if sd is not None:
                p = cw + t * sd + n * 0.02
                M.obox('Door', (p[0], p[1]), (t[0], t[1]), 0.42, 0.02, 0.0, 1.95, lin('#d8d4c8'))
                steps(M, n, cw, t, sd, 0.0, 1.1, B['_deckc'], n_steps=3)
    if not B['body']:
        return M
    o = B['body']; cx, cy, a, hw, hl = o
    body_walls(M, o, A, H, B)
    wallTop = H
    if B['flat']:
        c = (cx - A[0], cy - A[1]); u = (math.cos(a), math.sin(a))
        M.obox(roofm, c, u, hw + 0.25, hl + 0.25, wallTop, wallTop + 0.16, B['_roofc'], skip='b')
        M.obox('Trim', c, u, hw + 0.25, hl + 0.25, wallTop - 0.04, wallTop, B['_trimc'], skip='t')
        r = sx = None; span = lng = 0; z_r = wallTop + 0.16
    else:
        OH = 0.3 if typ in ('shed', 'garage') else 0.45
        span0 = hw if hl >= hw else hl
        rise = min(span0 * B['pitch'], 3.6 if typ == 'house' else 4.2 if B['barn'] else 2.8)
        r, sx, span, lng, z_r = gable_roof(M, o, A, B, wallTop, OH, rise, roofm, B['_roofc'], B['_trimc'], B['chim'], B['_foundc'])
    # the openings (camps3view planOpenings): windows in rows, bigger on the water side; the door away from it; a garage's big door
    walls = [wall_frame(w, A) for w in B['walls']]
    ends = ([2, 3] if hl >= hw else [0, 1])
    door_col = lin(B['door'])
    side_wall = 2 if B['dside'] < 2 else 0
    for k, (n, c, t, half) in enumerate(walls):
        front = k == B['wside']; L = 2 * half
        if typ == 'garage':
            if k == B['dside']:
                dw = min(L - 0.8, 2.7); p = c + n * 0.02
                M.obox('Door', (p[0], p[1]), (t[0], t[1]), dw / 2, 0.02, 0.0, 2.2, door_col)
                for zz in (0.55, 1.1, 1.65):   # (the overhead door's panels' joints)
                    M.obox('Trim', (p[0] + n[0] * 0.02, p[1] + n[1] * 0.02), (t[0], t[1]), dw / 2, 0.006, zz - 0.012, zz + 0.012, door_col * 0.7)
                for sg in (-1, 1):
                    q = c + t * sg * (dw / 2 + 0.05) + n * 0.02; M.obox('Trim', (q[0], q[1]), (t[0], t[1]), 0.05, 0.025, 0.0, 2.25, B['_trimc'])
            elif k == side_wall and hh(B['id'], 18) < 0.7: window(M, n, c, t, 0.0, 1.6, 0.8, 0.6, B, B['_trimc'])
            continue
        if typ == 'shed':
            if k == B['dside']:
                p = c + n * 0.02; M.obox('Door', (p[0], p[1]), (t[0], t[1]), 0.5, 0.02, 0.0, 1.9, door_col)
                for sg in (-1, 1):
                    q = c + t * sg * 0.55 + n * 0.02; M.obox('Trim', (q[0], q[1]), (t[0], t[1]), 0.05, 0.025, 0.0, 1.95, B['_trimc'])
            elif k == side_wall and hh(B['id'], 18) < 0.6: window(M, n, c, t, 0.0, 1.4, 0.6, 0.6, B, B['_trimc'])
            continue
        sd = L * B['dOff'] if k == B['dside'] else None
        if sd is not None:
            p = c + t * sd + n * 0.02
            M.obox('Door', (p[0], p[1]), (t[0], t[1]), 0.475, 0.02, 0.0, 2.05, door_col)
            if hh(B['id'], 41) < 0.5:   # (a lite in its upper half)
                g = c + t * sd + n * 0.045; M.poly('Glass', [g - t * 0.25 + Z * 1.3, g + t * 0.25 + Z * 1.3, g + t * 0.25 + Z * 1.85, g - t * 0.25 + Z * 1.85], n, t, -Z, WHITE)
            for a0, a1, z0, z1 in ((-0.555, -0.475, 0.0, 2.13), (0.475, 0.555, 0.0, 2.13), (-0.555, 0.555, 2.05, 2.13)):
                q = c + t * (sd + (a0 + a1) / 2) + n * 0.02; M.obox('Trim', (q[0], q[1]), (t[0], t[1]), (a1 - a0) / 2, 0.03, z0, z1, B['_trimc'])
            steps(M, n, c, t, sd, 0.0, 1.3, B['_deckc'], n_steps=4)
            if B['porch']: porch(M, B, A, H, n, c, t, sd)
        big = (1.4, 1.35) if typ == 'house' else (1.5, 1.3); small = (1.0, 1.3) if typ == 'house' else (0.9, 1.0)
        ww, wh = big if front else small
        # (the water side onto a deck: a slider to it, in the deck's middle)
        slider_at = None
        if front and B['deck']:
            dk = B['deck']; dc = v3(dk[0] - A[0], dk[1] - A[1]); slider_at = float(np.dot(dc - c, t))
            window(M, n, c, t, slider_at, 1.05, 1.8, 2.05, B, B['_trimc'], slider=True)
        n_w = max(1 if front else 0, round((L - 1.5) / (2.4 if front else 3.3)))
        for j in range(n_w):
            s = (j + 0.5) * L / n_w - L / 2
            sh_w = 0.55 * ww + 0.1 if (shut is not None and not front) else 0.0   # (a shuttered window needs room for its shutters)
            if sd is not None and abs(s - sd) < ww / 2 + sh_w + 0.8: continue
            if slider_at is not None and abs(s - slider_at) < ww / 2 + 1.2: continue
            if abs(s) > half - ww / 2 - 0.25: continue
            window(M, n, c, t, s, 1.5, ww, wh, B, B['_trimc'], shut=None if front else shut)
        if B['storeys'] == 2:
            for j in range(n_w):
                s = (j + 0.5) * L / n_w - L / 2
                if abs(s) > half - 0.85: continue
                window(M, n, c, t, s, 4.1, 1.2 if front else small[0], 1.2, B, B['_trimc'], shut=None if front else shut)
        elif typ == 'house' and k in ends and not B['flat']:
            window(M, n, c, t, 0.0, H + 0.6, 0.8, 0.9, B, B['_trimc'])
    if B['deck']: deck(M, B, A, o)
    return M

# ---------- a dock ----------
def dock(D):
    M = Mesh(); d = v3(D['dir'][0], D['dir'][1]); p = v3(-d[1], d[0]); hw = D['hw']; L = D['len']; alu = D['alu']
    wood = tint('#8c7c64', '#8a7458', 0.7, 1.3) * (0.9 + 0.2 * hh(D['j'], 1)); grey = tint('#a8a8a4', '#8a7458', 0.7, 1.6)
    deckc = grey if alu and hh(D['j'], 2) < 0.6 else wood
    def plat(s0, s1, a0, a1):   # a platform from s0 to s1 along, a0 to a1 across
        c = d * (s0 + s1) / 2 + p * (a0 + a1) / 2
        M.obox('Deck', (c[0], c[1]), (d[0], d[1]), (s1 - s0) / 2, (a1 - a0) / 2, -0.05, 0.0, deckc, top_tu=(p[0], p[1]))
        if alu:
            for a in (a0, a1):   # (the aluminium frame's side channels)
                q = d * (s0 + s1) / 2 + p * a; M.obox('Alu', (q[0], q[1]), (d[0], d[1]), (s1 - s0) / 2, 0.025, -0.2, -0.04, WHITE)
            for s in np.arange(s0 + 0.4, s1, 1.2):   # (its cross members)
                q = d * s + p * (a0 + a1) / 2; M.obox('Alu', (q[0], q[1]), (p[0], p[1]), (a1 - a0) / 2, 0.025, -0.15, -0.05, WHITE)
        else:
            for a in (a0 + 0.1, a1 - 0.1):   # (the stringers under the boards)
                q = d * (s0 + s1) / 2 + p * a; M.obox('Deck', (q[0], q[1]), (d[0], d[1]), (s1 - s0) / 2, 0.025, -0.25, -0.05, wood * 0.85)
            for a in (a0, a1):   # (the rim boards)
                q = d * (s0 + s1) / 2 + p * a; M.obox('Deck', (q[0], q[1]), (d[0], d[1]), (s1 - s0) / 2, 0.02, -0.22, -0.02, wood * 0.9)
        n = max(1, int(math.ceil((s1 - s0) / 2.4)))
        for k in range(n + 1):
            s = s0 + 0.1 + (s1 - s0 - 0.2) * k / n
            for a in (a0 + 0.08, a1 - 0.08):
                q = d * s + p * a
                if alu: M.cyl('Alu', (q[0], q[1]), 0.035, -3.5, -0.15, WHITE, n=8)
                else: M.obox('Deck', (q[0], q[1]), (d[0], d[1]), 0.06, 0.06, -3.5, -0.03, wood * 0.75, skip='b')
    plat(-1.5, L, -hw, hw)
    if D['head']:
        h = D['head']; plat(L - 2 * h['hd'], L, h['across'] - h['hl'], h['across'] + h['hl'])
    return M

# ---------- the boats at the docks (local metres: x forward, y to port, z up; the waterline at z 0) ----------
def loft(M, mat_out, mat_in, X, rows, col_out, col_in):
    # a hull from its sections: rows[k] = [(y, z), …] from the keel (y 0) up to the gunwale, one side (the other mirrored); its outside
    # and its inside
    for sg in (1, -1):
        for k in range(len(X) - 1):
            a, b = rows[k], rows[k + 1]
            for j in range(len(a) - 1):
                P = [v3(X[k], sg * a[j][0], a[j][1]), v3(X[k + 1], sg * b[j][0], b[j][1]), v3(X[k + 1], sg * b[j + 1][0], b[j + 1][1]), v3(X[k], sg * a[j + 1][0], a[j + 1][1])]
                n = np.cross(P[1] - P[0], P[3] - P[0])
                if np.linalg.norm(n) < 1e-9: n = np.cross(P[2] - P[1], P[3] - P[1])
                n = unit(n)
                if np.dot(n, v3(0, sg, -0.4)) < 0: n = -n   # (outward: away from the centreline, and down)
                M.poly(mat_out, P, n, X_AX, unit(P[3] - P[0]), col_out)
                M.poly(mat_in, P, -n, X_AX, unit(P[3] - P[0]), col_in)
X_AX = v3(1, 0, 0)

def skiff(col_hull, running=False):
    # a 14-ft aluminium boat: its riveted hull lofted from eight sections, the transom, the gunwale's rail, the floor, three bench
    # seats, a bow cap and the outboard tilted up on its bracket — or, running (an angler's), the outboard down in the water with its
    # tiller forward and a red fuel tank on the floor
    M = Mesh(); A = WHITE
    X = [-2.12, -1.6, -0.8, 0.2, 1.0, 1.6, 2.0, 2.18]
    HW = [0.70, 0.75, 0.77, 0.76, 0.68, 0.50, 0.26, 0.04]   # (half-beam at the gunwale)
    G = [0.36, 0.36, 0.37, 0.39, 0.42, 0.47, 0.53, 0.57]     # (the gunwale over the water)
    KL = [-0.13, -0.15, -0.16, -0.16, -0.13, -0.05, 0.12, 0.32]   # (the keel)
    rows = [[(0.0, KL[k]), (HW[k] * 0.45, KL[k] + 0.04), (HW[k] * 0.86, KL[k] + 0.09 + (0.1 if k > 4 else 0.0)), (HW[k], G[k])] for k in range(len(X))]
    loft(M, 'Alu', 'Alu', X, rows, col_hull, A * 0.92)
    tr = rows[0]; P = [v3(X[0], -y, z) for y, z in reversed(tr)] + [v3(X[0], y, z) for y, z in tr[1:]]
    M.poly('Alu', P, -X_AX, Y, -Z, col_hull); M.poly('Alu', [p + X_AX * 0.003 for p in P], X_AX, Y, -Z, A * 0.92)
    for sg in (1, -1):
        for k in range(len(X) - 1):
            M.seg('Alu', v3(X[k], sg * (HW[k] - 0.015), G[k] + 0.015), v3(X[k + 1], sg * (HW[k + 1] - 0.015), G[k + 1] + 0.015), 0.045, 0.035, A * 0.85)
    M.obox('Alu', (-0.4, 0), (1, 0), 1.55, 0.45, -0.07, -0.05, A * 0.75, skip='b')
    for x, w in ((-1.6, 0.68), (-0.15, 0.74), (1.15, 0.62)):
        M.obox('Alu', (x, 0), (1, 0), 0.17, w, 0.2, 0.24, A * 0.9)
    M.obox('Alu', (2.0, 0), (1, 0), 0.18, 0.22, 0.5, 0.53, A * 0.85)
    base = v3(X[0] - 0.05, 0, G[0] - 0.02)
    M.obox('PipeMetal', (base[0], 0), (1, 0), 0.06, 0.12, G[0] - 0.12, G[0] + 0.06, A)
    if running:   # (a 6-hp two-stroke: the powerhead over the transom, the leg down past the hull's bottom, the tiller forward)
        DK = lin('#2a2c30')
        cx = X[0] - 0.2
        M.obox('PipeMetal', (cx, 0), (1, 0), 0.2, 0.16, G[0] - 0.02, G[0] + 0.34, DK)
        M.obox('PipeMetal', (cx - 0.02, 0), (1, 0), 0.17, 0.14, G[0] + 0.34, G[0] + 0.38, DK * 1.3)
        M.seg('PipeMetal', v3(cx, 0, G[0] - 0.02), v3(cx, 0, -0.42), 0.08, 0.06, DK)
        M.obox('PipeMetal', (cx - 0.02, 0), (1, 0), 0.16, 0.05, -0.5, -0.4, DK)
        M.obox('PipeMetal', (cx - 0.04, 0), (1, 0), 0.08, 0.012, -0.58, -0.5, DK)
        M.seg('PipeMetal', v3(cx + 0.15, 0, G[0] + 0.22), v3(X[0] + 0.45, 0.04, G[0] + 0.2), 0.04, 0.04, DK)
        M.obox('Plastic', (-1.85, 0.35), (1, 0), 0.22, 0.15, -0.05, 0.2, lin('#b8261e'))
        return M
    t = math.radians(65)
    cow = base + v3(-0.25, 0, 0.18)
    M.obox('PipeMetal', (cow[0], 0), (1, 0), 0.24, 0.17, cow[2] - 0.14, cow[2] + 0.18, A)
    a = cow + v3(-0.05, 0, -0.14); b = a + v3(-0.55 * math.cos(t) - 0.3, 0, 0.55 * math.sin(t) * 0.25)
    M.seg('PipeMetal', a, b, 0.1, 0.07, A); M.seg('PipeMetal', b, b + v3(-0.12, 0, 0.02), 0.08, 0.08, A)
    return M

# ---------- the ice-fishing camp's things (local metres: z 0 the ice's top) ----------
def ice_shelter(col):
    # a pop-up hub shelter (~1.8 m square, 1.8 m high): four panels leaning in to a squarer top, its peak, a darker door panel with a
    # window, the skirt's flaps on the ice
    M = Mesh(); b, t, h, pk = 0.9, 0.62, 1.72, 1.86
    B = [v3(b, b), v3(-b, b), v3(-b, -b), v3(b, -b)]; T = [v3(t, t, h), v3(-t, t, h), v3(-t, -t, h), v3(t, -t, h)]
    for k in range(4):
        a0, a1, t0, t1 = B[k], B[(k + 1) % 4], T[k], T[(k + 1) % 4]
        mid = (a0 + a1) / 2; out = unit(v3(mid[0], mid[1], 0))
        n = unit(np.cross(a1 - a0, t0 - a0)); n = n if np.dot(n, out) > 0 else -n
        c = col * (0.65 if k == 3 else 1.0)
        M.poly('Canvas', [a0, a1, t1, t0], n, unit(a1 - a0), Z, c); M.poly('Canvas', [a0, t0, t1, a1], -n, unit(a1 - a0), Z, col * 0.5)
        tn = unit(np.cross(t1 - t0, v3(0, 0, pk) - t0)); tn = tn if tn[2] > 0 else -tn
        M.poly('Canvas', [t0, t1, v3(0, 0, pk)], tn, unit(t1 - t0), Z, col * 0.9)
        M.poly('Canvas', [a0, a1, a1 + out * 0.22 + v3(0, 0, 0.01), a0 + out * 0.22 + v3(0, 0, 0.01)], Z, unit(a1 - a0), out, col * 0.55)
    # (the door panel's window, on +X)
    M.poly('Vinyl', [v3(0.7, 0.22, 1.0), v3(0.7, -0.22, 1.0), v3(0.66, -0.2, 1.3), v3(0.66, 0.2, 1.3)], unit(v3(1, 0, 0.27)), Y, Z, WHITE * 0.06)
    return M

def bucket(col):
    M = Mesh(); M.cyl('Plastic', (0, 0), 0.15, 0.0, 0.37, col, n=14); M.cyl('Plastic', (0, 0), 0.16, 0.36, 0.39, col * 0.8, n=14); return M

def tipup(flag):
    # a tip-up over its hole: two crossed sticks on the ice, the upright, the spring and the orange flag — folded down over the hole, or
    # up (a fish on)
    M = Mesh(); W = lin('#c8b896')
    M.poly('Vinyl', [v3(0.12 * math.cos(2 * math.pi * k / 12), 0.12 * math.sin(2 * math.pi * k / 12), 0.004) for k in range(12)], Z, X_AX, Y, WHITE * 0.03)
    M.seg('Plastic', v3(-0.42, 0, 0.02), v3(0.42, 0, 0.02), 0.035, 0.02, W); M.seg('Plastic', v3(0, -0.42, 0.04), v3(0, 0.42, 0.04), 0.035, 0.02, W)
    M.seg('Plastic', v3(0, 0, 0.05), v3(0, 0, 0.32), 0.03, 0.03, W)
    O = lin('#ff5a0a')
    if flag:
        M.seg('PipeMetal', v3(0, 0, 0.3), v3(0.05, 0, 0.75), 0.01, 0.01, WHITE * 0.6)
        q = [v3(0.05, 0, 0.75), v3(0.05, 0, 0.62), v3(0.05, 0.16, 0.66), v3(0.05, 0.16, 0.76)]
        M.poly('Canvas', q, X_AX, Y, Z, O); M.poly('Canvas', q[::-1], -X_AX, Y, Z, O)
    else:
        M.seg('PipeMetal', v3(0, 0, 0.3), v3(0.4, 0, 0.06), 0.01, 0.01, WHITE * 0.6)
        M.poly('Canvas', [v3(0.4, 0, 0.065), v3(0.27, 0, 0.065), v3(0.29, 0.16, 0.065), v3(0.41, 0.16, 0.065)], Z, X_AX, Y, O)
    return M

def ice_hole():
    M = Mesh(); M.poly('Vinyl', [v3(0.1 * math.cos(2 * math.pi * k / 14), 0.1 * math.sin(2 * math.pi * k / 14), 0.004) for k in range(14)], Z, X_AX, Y, WHITE * 0.03)
    for k in range(14):   # (the slush ringing it)
        a0, a1 = 2 * math.pi * k / 14, 2 * math.pi * (k + 1) / 14
        M.poly('Plastic', [v3(0.1 * math.cos(a0), 0.1 * math.sin(a0), 0.006), v3(0.24 * math.cos(a0), 0.24 * math.sin(a0), 0.003), v3(0.24 * math.cos(a1), 0.24 * math.sin(a1), 0.003), v3(0.1 * math.cos(a1), 0.1 * math.sin(a1), 0.006)], Z, X_AX, Y, lin('#a8b4b8'))
    return M

def sled():
    # a black plastic jet sled, its low walls, a canvas bag of gear in it
    M = Mesh(); K = WHITE * 0.05
    M.obox('Plastic', (0, 0), (1, 0), 0.62, 0.28, 0.0, 0.03, K)
    for y in (-0.28, 0.28): M.obox('Plastic', (0, y), (1, 0), 0.62, 0.015, 0.0, 0.2, K)
    for x in (-0.62, 0.62): M.obox('Plastic', (x, 0), (1, 0), 0.015, 0.28, 0.0, 0.2, K)
    M.obox('Canvas', (-0.1, 0), (1, 0), 0.35, 0.2, 0.03, 0.22, lin('#5a5a50'))
    return M

def kayak(col):
    # a 12-ft sit-in kayak: its hull and deck lofted round, the cockpit's coaming and its dark opening
    M = Mesh(); L = 3.66; X = list(np.linspace(-L / 2, L / 2, 15)); rows = []
    for x in X:
        f = max(1 - (2 * x / L) ** 2, 0.0) ** 0.6
        hw, deck, keel = 0.33 * f + 0.005, 0.2 + 0.04 * (1 - f), -0.11 * f + 0.06 * (1 - f)
        rows.append([(0.0, keel), (hw * 0.7, keel + 0.03 * f), (hw, 0.07), (hw * 0.75, deck - 0.03), (0.0, deck)])
    loft(M, 'Plastic', 'Plastic', X, rows, col, col * 0.7)
    c = v3(0.05, 0, 0.22)
    ring = [c + v3(0.45 * math.cos(2 * math.pi * k / 16), 0.24 * math.sin(2 * math.pi * k / 16), 0.03) for k in range(16)]
    for k in range(16): M.seg('Plastic', ring[k], ring[(k + 1) % 16], 0.035, 0.03, col * 0.35)
    M.poly('Vinyl', [p + Z * 0.005 for p in ring], Z, X_AX, Y, WHITE * 0.05)
    return M

def pontoon():
    # a 23-ft pontoon boat: two aluminium tubes with their nose cones, the deck, the fence and its gates, the console and the
    # benches, the bimini on its posts, the outboard
    M = Mesh(); A = WHITE
    for y in (-0.85, 0.85):
        for k in range(14):
            a0, a1 = 2 * math.pi * k / 14, 2 * math.pi * (k + 1) / 14
            for x0, x1, r0, r1, z1 in ((-3.4, 2.9, 0.3, 0.3, 0.0), (2.9, 3.45, 0.3, 0.1, 0.12)):
                P = [v3(x0, y + r0 * math.cos(a0), 0.05 + r0 * math.sin(a0)), v3(x1, y + r1 * math.cos(a0), 0.05 + z1 + r1 * math.sin(a0)),
                     v3(x1, y + r1 * math.cos(a1), 0.05 + z1 + r1 * math.sin(a1)), v3(x0, y + r0 * math.cos(a1), 0.05 + r0 * math.sin(a1))]
                M.poly('Alu', P, v3(0, math.cos((a0 + a1) / 2), math.sin((a0 + a1) / 2)), X_AX, Z, A)
    M.obox('Deck', (0, 0), (1, 0), 3.5, 1.25, 0.38, 0.48, tint('#8a8070', '#8a7458'), top_tu=(0, 1))
    for y in (-1.2, 1.2): M.obox('Alu', (-0.2, y), (1, 0), 3.1, 0.025, 0.48, 1.31, A * 0.9)
    M.obox('Alu', (-3.3, 0), (1, 0), 0.025, 1.2, 0.48, 1.31, A * 0.9)
    for y in (-0.8, 0.8): M.obox('Alu', (2.9, y), (1, 0), 0.025, 0.4, 0.48, 1.31, A * 0.9)
    M.obox('Vinyl', (0.9, 0.65), (1, 0), 0.3, 0.28, 0.48, 1.38, lin('#d8d6d0'))
    for x in (-2.4, 0.0, 1.9): M.obox('Vinyl', (x, -0.95), (1, 0), 0.45, 0.22, 0.48, 0.92, lin('#d8d6d0'))
    for x in (-1.6, 0.6):
        for y in (-1.15, 1.15): M.cyl('Alu', (x, y), 0.02, 1.31, 2.55, A, n=6)
    M.obox('Canvas', (-0.5, 0), (1, 0), 1.3, 1.18, 2.55, 2.6, lin('#2e3a48'))
    M.obox('PipeMetal', (-3.75, 0), (1, 0), 0.2, 0.15, 0.4, 1.1, A)
    return M

BOATS = {'boat_skiff_alu': skiff(WHITE), 'boat_skiff_green': skiff(lin('#3e5a3a') * 1.6), 'boat_pontoon': pontoon()}
BOATS['boat_skiff_running'] = skiff(WHITE, running=True)   # (the anglers' boats out on the water)
def dock_section(alu):
    # a dock's section out of the water for the winter (camps3view: stacked on the bank): its deck on two stringers, its legs off
    M = Mesh()
    if alu:
        M.obox('Alu', (0, 0), (1, 0), 1.2, 0.5, 0.06, 0.14, WHITE * 0.85)
        for y in (-0.47, 0.47): M.obox('Alu', (0, y), (1, 0), 1.2, 0.03, 0.0, 0.14, WHITE * 0.9)
    else:
        for k in range(16):
            x = -1.2 + (k + 0.5) * 2.4 / 16
            M.obox('Deck', (x, 0), (1, 0), 0.07, 0.5, 0.1, 0.14, tint('#8a7a64', '#8a7458') * (0.9 + 0.2 * hh(k, 3)))
        for y in (-0.42, 0.42): M.obox('Deck', (0, y), (1, 0), 1.2, 0.04, 0.0, 0.1, tint('#6a5a48', '#8a7458'))
    return M
BOATS['dock_section_wood'] = dock_section(False); BOATS['dock_section_alu'] = dock_section(True)
for nm, c in (('red', '#7a1e1e'), ('blue', '#1e3456'), ('black', '#202224')): BOATS['ice_shelter_' + nm] = ice_shelter(lin(c))
BOATS.update({'ice_bucket_white': bucket(WHITE * 0.85), 'ice_bucket_orange': bucket(lin('#e0661e')), 'ice_tipup': tipup(False),
              'ice_tipup_flag': tipup(True), 'ice_hole': ice_hole(), 'ice_sled': sled()})
for nm, c in (('red', '#b8322a'), ('yellow', '#e0b020'), ('orange', '#e06a1e'), ('green', '#3f8a3a'), ('blue', '#2a5a9a')):
    BOATS['boat_kayak_' + nm] = kayak(lin(c))

parts = {'buildings': {}, 'docks': {}}
tri = 0
for B in J['buildings']:
    M = building(B); write_glb(os.path.join(OUT, f"{B['id']}.glb"), B['id'], M); tri += M.count()
    probes = []
    for bx in [B['body'], *B['units'], B['deck']]:
        if not bx: continue
        cx, cy, a, hw_, hl_ = bx; u = (math.cos(a), math.sin(a)); v = (-u[1], u[0])
        probes += [[round(cx + u[0] * i * hw_ + v[0] * j * hl_, 2), round(cy + u[1] * i * hw_ + v[1] * j * hl_, 2)] for i in (-1, 1) for j in (-1, 1)] + [[cx, cy]]
    parts['buildings'][B['id']] = {'anchor': B['anchor'], 'probes': probes, 'type': B['type'], 'home': B['home'], 'tris': M.count()}
for D in J['docks']:
    M = dock(D); name = f"dock_{D['j']}"; write_glb(os.path.join(OUT, name + '.glb'), name, M); tri += M.count()
    parts['docks'][name] = {'anchor': D['w'], 'dir': D['dir'], 'len': D['len'], 'camp': D['camp'], 'tris': M.count()}
# the boats: their meshes, and where each dock's are (a skiff or the pontoon alongside, a canoe or a kayak on the deck or the bank)
for nm, M in BOATS.items(): write_glb(os.path.join(OUT, nm + '.glb'), nm, M); tri += M.count()
parts['boats'] = []
for D in J['docks']:
    name = f"dock_{D['j']}"
    if D.get('boat') and D.get('slot'):
        mesh = 'boat_pontoon' if D['boat'] == 'pontoon' else ('boat_skiff_green' if hh(D['j'], 20) < 0.35 else 'boat_skiff_alu')
        parts['boats'].append({'mesh': mesh, 'xy': D['slot'][:2], 'yaw': D['slot'][2], 'on': 'water', 'dock': name})
    if D.get('canoe'):
        k = D['canoe']; mesh = 'canoe' if k['kind'] == 'canoe' else 'boat_kayak_' + ('red', 'yellow', 'orange', 'green', 'blue')[int(hh(D['j'], 21) * 5)]
        parts['boats'].append({'mesh': mesh, 'xy': k['at'][:2], 'yaw': k['at'][2], 'on': 'deck' if k['onDeck'] else 'bank', 'dock': name, 'flip': k['kind'] == 'canoe'})
print(f"boats: {len(parts['boats'])} at the docks")
json.dump(parts, open(os.path.join(OUT, 'camps_parts.json'), 'w'), indent=0)
print(f"{len(parts['buildings'])} buildings, {len(parts['docks'])} docks -> {OUT}: {tri} triangles")

# the texture sets' mean brightness (linear), for import_camps.py's painted surfaces (shading = brightness / mean): when downloaded
try:
    from PIL import Image
    TEXD = os.path.join(IMP, 'textures'); mf = os.path.join(TEXD, 'manifest.json')
    if os.path.exists(mf):
        means = {}
        for slot, m in json.load(open(mf, encoding='utf-8')).items():
            f = (m.get('files') or {}).get('basecolor')
            if not f: continue
            a = np.asarray(Image.open(os.path.join(TEXD, slot, f)).convert('RGB').resize((256, 256)), np.float64) / 255
            a = np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
            means[slot] = round(float((a @ np.array([0.2126, 0.7152, 0.0722])).mean()), 4)
        json.dump(means, open(os.path.join(TEXD, 'means.json'), 'w'), indent=1); print('texture means:', means)
except ImportError:
    print('(no Pillow: the texture means not measured)')
