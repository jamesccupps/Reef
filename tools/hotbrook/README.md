# Hot Brook landscape model

A 3-D model of the real place the sim is based on: Upper and Lower Hot Brook Lake and Hot Brook (T8 R4 NBPP / Danforth,
Maine), 5.8 × 12.7 km, on a 15 m grid. It is the reference for building the shore, the land and the air into the sim
(`docs/reports/Maine lake shores and catchment.md`). Published as an artifact: https://claude.ai/artifact/7e75Q4UqJJw4jEfx5gF7ye

    python tools/hotbrook/fetch_data.py    # public data → tools/hotbrook/data/ (git-ignored)
    python tools/hotbrook/soundings.py     # the 1949 MDIFW soundings → data/soundings.json (maps fitted to today's shore)
    python tools/hotbrook/build_model.py   # → data/hotbrook_model.json (needs numpy + Pillow; node for the sim strip)

`viewer.html` is the three.js viewer (map colours / aerial photo / depth chart with 2-ft contours and the soundings;
seasons; a cut-away section you slide south↔north; an underwater dive; the human's field notes from `field_notes.json`).
It loads three.js from public CDNs, so open it from the artifact, or from a plain static server next to
`hotbrook_model.json` and `naip.jpg` — not through `serve.mjs`, whose CSP allows only the app's own scripts.

| Layer | Source | Notes |
|---|---|---|
| Lake outlines, brooks | OpenStreetMap via Nominatim (© OpenStreetMap contributors, ODbL) | Upper 375 ha / Lower 279 ha on the grid (MDIFW: 360 / 277) |
| Elevation | USGS 3DEP via AWS Terrain Tiles, z14 (~6.7 m) | water surfaces from the DEM: Upper 129.1 m, Lower 128.5 m |
| Wetlands | USFWS National Wetlands Inventory | PFO wooded swamp, PSS shrub swamp, PEM marsh, riverine |
| Land cover | NLCD 2021 (30 m) | forest type (evergreen / mixed / deciduous), fields, camps and roads |
| Lake beds | MDIFW lake-survey maps, 1949 (rev. 1965, 2004): 83 spot soundings on Upper, 63 on Lower (feet) | **measured**: the scans fitted onto the OSM shoreline by trimmed ICP (similarity → affine; median misfit 18 m), depth = a 50 m shore taper × the soundings' basin depth spread by IDW. Means 3.05 / 2.67 m (published 3.35 / 2.74), max 18 / 13 ft |
| Aerial photo | USDA NAIP via the USGS National Map (public domain), ~3.3 m/px | the viewer's photo layer |
| Field notes | the human (fishes these lakes): `field_notes.json` | pumpkinseed + redbreast at the brook's upper-mouth pool, a shallow brook stretch, the cove between Upper's west points |
| Shore | MDIFW survey notes | mostly rocky; one sandy beach on Upper's NE shore (placed by hand from the description) |

The model's `profile` is the real cross-section along the river centreline from Upper's south shore to Lower's outlet
(6.5 km) — the line the sim's slice stands for; `sim` is the sim's current `bedY` for comparison.
