# Hot Brook landscape model

A 3-D model of the real place the sim is based on: Upper and Lower Hot Brook Lake and Hot Brook (T8 R4 NBPP / Danforth,
Maine), 5.8 × 12.7 km, on a 15 m grid. It is the reference for building the shore, the land and the air into the sim
(`docs/reports/Maine lake shores and catchment.md`). Published as an artifact: https://claude.ai/artifact/7e75Q4UqJJw4jEfx5gF7ye

    python tools/hotbrook/fetch_data.py    # public data → tools/hotbrook/data/ (git-ignored)
    python tools/hotbrook/soundings.py     # the 1949 MDIFW soundings → data/soundings.json (maps fitted to today's shore)
    python tools/hotbrook/build_model.py   # → data/hotbrook_model.json (needs numpy + Pillow; node for the sim strip)

TRUE SCALE (docs/TRUE_SCALE.md T1): the same chain at 5 m over the lakes' box, then the true-size world for the sim:

    HB_CELL=5 HB_CROP=-67.9563,45.5995,-67.9209,45.6665 HB_MODEL_OUT=hotbrook_model_5m.json HB_SHALLOWS=shallows_5m.json python tools/hotbrook/build_model.py
    HB_MODEL=hotbrook_model_5m.json HB_SHALLOWS_OUT=shallows_5m.json python tools/hotbrook/shallows.py
    (build_model.py again, as above, to take the shelf in)
    HB_MODEL=hotbrook_model_5m.json HB_SCALE=1 HB_BROOK_SCALE=1 HB_BROOK_W=8 HB_MARGIN=150 HB_JS=src/w3/true/hotbrook3d.js HB_SIM_ONLY=1 python tools/hotbrook/build_world3d.py

Then the renderer's far land and aerial photo for the true world (T6a). They come from the full-box 15-m model, since the 5-m one
stops ~250 m past the lakes' band. The photo takes the ~1-m NAIP tiles (`data/naip_hr`) where they cover. Run it with
HB_OUT=<scratch dir> so the run's own band module doesn't overwrite anything; take far3d.js and naip3.jpg from HB_FAR_OUT:

    HB_MODEL=hotbrook_model.json HB_SCALE=1 HB_BROOK_SCALE=1 HB_BROOK_W=8 HB_MARGIN=150 HB_OUT=<scratch> HB_FAR_M=1500 HB_FAR_CELL=20 HB_PHOTO_M=1.5 HB_PHOTO_HR=1 HB_FAR_OUT=src/w3/true python tools/hotbrook/build_world3d.py

(the default 1/10 build is byte-identical to before: hotbrook3d.js, far3d.js and naip3.jpg)

(Set PYTHONIOENCODING=utf-8 on Windows: the scripts print λ and °.)

`viewer.html` is the three.js viewer (map colours / aerial photo / depth chart with 2-ft contours and the soundings;
seasons; a cut-away section you slide south↔north; an underwater dive; the human's field notes from `field_notes.json`).
It loads three.js from public CDNs, so open it from the artifact, or from a plain static server next to
`hotbrook_model.json` and `naip.jpg` — not through `serve.mjs`, whose CSP allows only the app's own scripts.

| Layer | Source | Notes |
|---|---|---|
| Lake outlines | USGS 3DEP lidar 2017 (ME Eastern B1/B2), the lakes' hydro-flattened surfaces (`lidar_dem_2m.tif`) | Upper 369 ha / Lower 274 ha on the grid (MDIFW: 360 / 277); OSM's outline (375 / 279) shared 97–98 % of the cells |
| Brooks | OpenStreetMap via Nominatim (© OpenStreetMap contributors, ODbL) | inflow, connecting brook (154 m), outlet |
| Elevation | USGS 3DEP lidar 2017, 1-m bare-earth DEM via the 3DEP ImageServer (`lidar_dem_box.tif`, ~3.5 × 5 m), area-mean per cell | water surfaces (2017): Upper 128.93 m, Lower 128.23 m (a 0.70-m fall along the brook). The former z14 terrain tiles: 1.8 m RMS off it |
| Wetlands | USFWS National Wetlands Inventory | PFO wooded swamp, PSS shrub swamp, PEM marsh, riverine |
| Land cover | NLCD 2021 (30 m) | forest type (evergreen / mixed / deciduous), fields, camps and roads |
| Lake beds | MDIFW lake-survey maps, 1949 (rev. 1965, 2004): 83 spot soundings on Upper, 63 on Lower (feet) | **measured**: the scans fitted onto the OSM shoreline by trimmed ICP (similarity → affine; median misfit 18 m), depth = a 50 m shore taper × the soundings' basin depth spread by IDW. Means 3.05 / 2.67 m (published 3.35 / 2.74), max 18 / 13 ft |
| Aerial photo | USDA NAIP via the USGS National Map (public domain), ~3.3 m/px | the viewer's photo layer |
| Shallow shelf | USDA NAIP ~1 m RGB + near-infrared (`naip_hr/`), `shallows.py` | satellite-derived depth of the visible-bottom band, its edge at 1.3 m (the human: "chest height … where the water gets darker"); used only for the 0–1.5 m fringe (at 1–3 m it has no skill against the soundings left out: r −0.01 vs the bed's 0.55) |
| Field notes | the human (fishes these lakes): `field_notes.json` | pumpkinseed + redbreast at the brook's upper-mouth pool, a shallow brook stretch, the cove between Upper's west points |
| Shore | MDIFW survey notes | mostly rocky; one sandy beach on Upper's NE shore (placed by hand from the description) |

The model's `profile` is the real cross-section along the river centreline from Upper's south shore to Lower's outlet
(6.5 km) — the line the sim's slice stands for; `sim` is the sim's current `bedY` for comparison.
