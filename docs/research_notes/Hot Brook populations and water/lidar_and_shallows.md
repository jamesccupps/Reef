# The lakes' shape from lidar and aerial photos (2026-10-16)

Prompted by the human's high-resolution aerial images of both lakes ("if they are better than what you were making the 3d model on, then you should use these … see if there's any lidar for that area too … could you estimate a more accurate depth by the shores by looking at aerial photos?").

## What exists

**Lidar.** USGS 3DEP *ME Eastern B1/B2 2017* (QL2) covers both lakes and the brook. TNM Access lists:
- 18 point-cloud tiles (LAZ, 28–83 MB each, published 2019);
- a 1-m DEM tile, `x58y506`, at 361 MB (B1) + 87 MB (B2).

The 3DEP ImageServer serves the 1-m bare-earth DEM on demand: max 8,000 px a side, and a single 1-m export of the lakes failed, so the lakes were fetched at ~1.4 × 1.8 m and the whole box at ~3.5 × 5 m. Lakes are **hydro-flattened**: one flat level per lake.

**Aerial photos.** USDA NAIP via the USGS National Map, mostly 0.6 m and 4-band (RGB + near-infrared), public domain. It was fetched at ~1 m in 2 × 2 tiles a lake (larger requests time out).

**The human's Google Earth images.** Used as the visual reference: shoreline, trees, the shallow band, the brook through the trees. They are not copied into the project, because Google's imagery is licensed.

## What the lidar showed

- **Water levels in 2017:** Upper **128.93 m**, Lower **128.23 m**. That is a 0.70-m fall along the 154-m brook; the old terrain tiles gave 129.06 / 128.46.
- **Shorelines:** the hydro-flattened water on the model's 15-m grid is Upper 369 ha and Lower 274 ha (MDIFW 360 / 277). OpenStreetMap's outline (375 / 279 ha) shares 97.4 % / 97.8 % of the cells; the difference is a one-cell fringe all round, with no misplaced points, coves or islands. The model now uses the lidar's water. One detached flat patch at Upper's level, up the inflow, is dropped: each lake keeps its one connected body.
- **Terrain:** against the lidar, the z14 terrain tiles the model used were 0.35 m low on average, 1.8 m RMS, and −3.1…+2.5 m (5–95 %). That is the blocky banks and brook valley. The model's land is now the lidar's area mean per 15-m cell.

## The shallow shelf from the photos (`tools/hotbrook/shallows.py`)

**Why.** Only 4 of each lake's 63–83 soundings lie within 50 m of shore (median ~150 m out), and the 1949 map fits only to ~18 m. So the model's shelf was a uniform 50-m exponential taper everywhere.

**Method** (satellite-derived bathymetry). Per NAIP tile (the flight strips differ):
1. Take the deep water's brightness L∞ and noise σ, from water over > 3 m of the soundings' bed and > 120 m from shore.
2. The bottom's excess brightness is E = (R − R∞) + (G − G∞), with a 5 × 5 median against waves.
3. Floating leaves and stems are bright in near-infrared, where NIR > N∞ + 10 and NIR > red (the vegetation index; plain NIR also caught wind-roughened water).
4. Beer–Lambert gives E = E0·e^(−gz), where E0 is the bright bottom at the waterline nearby (the 95th percentile of E within ~45 m, so the bottom's colour cancels).
5. The band's dark outer edge is where E = max(3σ, 12 DN). Its depth comes from the human's field observation on Upper: "only a foot or two deep and go out a bit before it gets deeper … maybe to chest height before it gets deeper, probably where the water gets darker". So that edge is set at **1.3 m**, and z = 1.3 · ln(E0/E) / ln(E0/E_th).
6. The clarity alone (Kd ≈ 1.44/Secchi 3.9 m) would put the edge at 1.8–3 m. The excess is mostly red light, which brown water takes faster (g ≈ 1.75/m ≈ 2 × 0.9).

**Validation against the soundings** (leave-one-out; the 21 soundings ≤ 3 m with photo depths around them):

| Method | Bias | RMS | MAE | r with the soundings |
|---|---|---|---|---|
| The bed's taper × IDW (the sounding left out) | +0.16 | 0.71 | 0.55 | 0.55 |
| The photo's depth (physics scale) | −0.03 | 0.84 | 0.68 | −0.01 |
| Their average | | 0.60 | 0.51 | |

- At 1–3 m the photo carries no point skill: the bottom's light is near the noise there, and the soundings' 18-m map error is as wide as the band.
- The photo's information is the 0–1.3 m fringe itself, where no sounding exists: which shores are wide flats and which drop off.

**Use** (build_model.py):
- A shore-joined 'bottom' cell's photo depth replaces the bed fully at ≤ 1.0 m, fading out by 1.5 m. A lone cell out in open water is glint, not a shoal, and is dropped.
- A floating-leaved cell caps the bed at 1.8 m.

**Results:**

| | Area ≤ 1 m | Area ≤ 3 m | Mean |
|---|---|---|---|
| Upper | 5 → 12 % | 43 % (unchanged) | 3.05 → 3.00 m |
| Lower | 6 → 17 % | 56 % (unchanged) | 2.67 → 2.55 m |

Lower's shelf is broad: the west shore and the north-east lobe. The published means (3.35 / 2.74) are the 1949 survey's, whose soundings never reached the shore.

## Still open

- **Tree canopy from the lidar's point clouds** (first returns − bare earth) or from NAIP's near-infrared: where the trees really stand and how tall. The model's trees are placed by NLCD's 30-m classes.
- **Validating the shelf in the field:** the human's own wading depths at known spots.
