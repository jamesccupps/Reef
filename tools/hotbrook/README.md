# Hot Brook landscape model

A 3-D model of the real place the sim is based on: Upper and Lower Hot Brook Lake and Hot Brook (T8 R4 NBPP / Danforth,
Maine), 5.8 × 12.7 km, on a 15 m grid. It is the reference for building the shore, the land and the air into the sim
(`docs/reports/Maine lake shores and catchment.md`). Published as an artifact: https://claude.ai/artifact/7e75Q4UqJJw4jEfx5gF7ye

    python tools/hotbrook/fetch_data.py    # public data → tools/hotbrook/data/ (git-ignored)
    python tools/hotbrook/build_model.py   # → data/hotbrook_model.json (needs numpy + Pillow; node for the sim strip)

`viewer.html` is the three.js viewer (it loads three.js from public CDNs, so open it from the artifact, or from a plain
static server next to `hotbrook_model.json` — not through `serve.mjs`, whose CSP allows only the app's own scripts).

| Layer | Source | Notes |
|---|---|---|
| Lake outlines, brooks | OpenStreetMap via Nominatim (© OpenStreetMap contributors, ODbL) | Upper 375 ha / Lower 279 ha on the grid (MDIFW: 360 / 277) |
| Elevation | USGS 3DEP via AWS Terrain Tiles, z14 (~6.7 m) | water surfaces from the DEM: Upper 129.1 m, Lower 128.5 m |
| Wetlands | USFWS National Wetlands Inventory | PFO wooded swamp, PSS shrub swamp, PEM marsh, riverine |
| Land cover | NLCD 2021 (30 m) | forest type (evergreen / mixed / deciduous), fields, camps and roads |
| Lake depths | MDIFW lake surveys; Lakes of Maine (MIDAS 1076, 1072) | **approximated**: depth grows with distance from shore, fitted to each lake's mean and max (Upper 3.35 / 5.5 m, Lower 2.74 / 4.0 m) — not surveyed contours |
| Shore | MDIFW survey notes | mostly rocky; one sandy beach on Upper's NE shore (placed by hand from the description) |

The model's `profile` is the real cross-section along the river centreline from Upper's south shore to Lower's outlet
(6.5 km) — the line the sim's slice stands for; `sim` is the sim's current `bedY` for comparison.
