# Hot Brook Lakes in Unreal Engine 5 — the first-person world

The human (2026-10-23): the first-person view must be "videogame quality and realistic even if it has to run a completely
different set of textures or engine". So the simulation stays the pure JavaScript core it is (`src/`), and this Unreal Engine 5
project draws the world in the first person, fed live by it. The browser view, the data page and the gate are unchanged.

- **The project** lives at `G:\HotBrookUE` (`ue/setup.ps1` makes it): its `Source`, `Config` and `Scripts` are directory
  junctions back to `ue/HotBrook/` here (the code stays versioned); `Content` (the assets — Fab/Megascans packs may not be put in
  this public repository), `Import`, the builds and the caches stay on G:.
- **The world** — `HB_WORLD=true node ue/export/export_world.mjs` writes `G:\HotBrookUE\Import`: the ground and the lake beds as a
  2-m heightmap (the 2017 lidar, the 1949 soundings), the water's surface grid, the lakes' shorelines and the brook, the camps.
- **The level** — `UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=HotBrookBuild` makes `/Game/Maps/HotBrook` from
  them: the landscape, the physical sky, the sun, volumetric clouds, the haze, the walker's start.
- **The lakes** — `AHotBrookWaterSurface`: each lake's shoreline (`Import/lakes.json`, the 0.25-m depth line) pushed 12 m out under the banks, triangulated
  and laid at its level (Upper 128.93 m, Lower 128.23 m) with `M_LakeWater` (Single Layer Water: the tea-coloured water's
  absorption and scattering, Lumen's reflections). Unreal's Water plugin bodies were tried first and dropped: built headless they
  crashed the build and never drew in the game.
- **The ground** — `M_Ground`: Quixel Megascans forest floors (needles and moss, broadleaf litter, moss carpets), rocky floor on
  slopes, mud at the water's edge, and past ~900 m the aerial photos' canopy (the trees stream only within ~1.2 km).
- **The forest** — `AHotBrookForest`: the ~1.9 M trees of `Import/trees.bin` (`ue/export/export_forest.mjs`), streamed in 200-m
  tiles about the walker, each species drawn with its Quixel Megaplants look-alike (`Import/forest_meshes.json`, written by
  `Scripts/make_forest_meshes.py`): red spruce and balsam fir the Norway spruce, white pine the Baltic pine, cedar the Japanese
  cypress, paper birch the silver birch, aspen, red maple the Norway maple, beech, alder, hazel, willow, the snags the dead pine,
  the young hardwoods the maple, beech and rowan saplings. Megaplants are skinned meshes: their branches sway in the Dynamic Wind
  plugin's GPU wind, set from the sim's wind speed and direction. Each trunk has a hidden collider.
- **The forest's stocking** — `ue/export/export_forest.mjs` stocks the woods as the Forest Inventory measures Maine's
  (docs/research_notes/Maine forest structure/): ~3,000 stems a hectare over 2 m at full stocking (most of them young fir and maple
  under the canopy), by height class, ~55 snags; each tree drawn with the variant of its species nearest its height; the small
  ones drawn only near (under 6 m to 300 m, under 12 m to 600 m).
- **The ground cover** — `AHotBrookGroundCover`: ferns, forbs (wood anemone), lowbush blueberry and lingonberry (bilberry), grasses
  in the open and on the shore, the shore's low shrub band, mushrooms, stones, mossy boulders and outcrops, fallen logs — each at
  the cover the Forest Inventory measures (ferns ~15 %, forbs ~22 %, low shrubs ~17 %; less under closed spruce–fir), in patches,
  by the stand about it (the forest's own trees) and the water's nearness; streamed in 32-m cells in three rings (80/160/400 m).
  Its meshes: the Megascans scans (`Scripts/import_megascans.py` → `Import/megascans_meshes.json`) and the Megaplants' small
  plants (`make_forest_meshes.py` → `Import/groundcover_meshes.json`).
- **The live link** — `node ue/link/simhost.mjs` runs the sim at real time and streams it to `AHotBrookLink`
  (ws://127.0.0.1:8771; snapshot "HBS2"): the clock (the sun placed for the date and hour), the weather and wind, the fish near
  the walker, the forest's large animals.
- **The forest's animals** — `AHotBrookAnimals`: every deer, black bear and moose the sim has, at its place and heading, playing
  the gait nearest its speed (the bear walks slow to sprints; its clips' own travel locked so the sim moves it) or the idle for what
  it does (grazing, browsing, drinking, fishing, bedded; a denned bear isn't drawn), scaled to its length; her young at heel at their
  age's length (forest3's); a bull moose's antlers from mid-May to about New Year. The deer are the Animal Variety Pack's; the bear
  and moose are the human's own models (`Scripts/import_animals.py`; never committed or shared), recoloured for Maine by
  `ue/export/recolor_animals.py` (the bear a black bear with a tan muzzle; the moose darker). `-hbshot` takes `nearbear`,
  `neardeer`, `nearmoose` (and `nearfish`) to frame the nearest one.
- **The fish** — `AHotBrookFish`: each fish the sim has near the walker drawn as its species' model, scaled to its length and
  deepened by its condition, at its place, heading and pitch, eased between the snapshots; its tail beating at the browser's rate
  for its speed (`M_HB_Fish`'s swim wave, its phase per fish in the instance's custom data); a school as up to 24 of its fish
  ~3 lengths apart by day, ~8 at night. Redbreast borrow the pumpkinseed, fallfish and alewife the dace.
- **The birds** — `AHotBrookWildlife`: the loons, great blue herons and bald eagles the sim has on the lakes now (fish3 `_wildN`
  through the link — none out of season), each lake its share; loons swim the open water and dive every minute or two (one dives
  where the sim says a loon took a fish, and comes up there), resting on the water at night; herons stand in the shallows and step
  slowly between spots; eagles circle high by day and stoop to the water where the sim's eagle took a fish. (No models yet for the
  ospreys, kingfishers, mergansers, otters and mink the sim also keeps.) `-hbshot` takes `nearloon`, `nearheron`, `neareagle`.
- **The models** — downloaded from Sketchfab to `G:\HotBrookUE\Import\sketchfab` (never committed); `ue/export/convert_models.py`
  (Blender 5.1) lays each on its axes (a fish's length on +X, back up), cuts it to ~12,000 triangles (birds 24,000, the canoe
  30,000), sizes it (a fish 1 m long; a bird, a boat to its real size) and writes `Import/models/<name>.glb` with three views to
  check it by; `Scripts/import_models.py` brings them in (`/Game/HotBrook/Models`) and makes `M_HB_Fish`. The loon's Collada
  file went through trimesh + pycollada to a .glb first (Blender 5 reads no Collada).
- **The walker** — `HotBrookCharacter`: first person at 1.65 m; W A S D / arrows, mouse, Shift to run, Space to jump; wading,
  swimming past chest depth (the head riding the water: a slow swell and a breaststroke's rhythm), diving with C / Ctrl; on the ice
  in winter.
- **The canoe** — `AHotBrookBoat`: a 5-m canoe waiting in the shallows nearest the start. **E** beside it gets in (the stern seat)
  and out (onto the shore within ~8 m, else over the side); W / S paddle, A / D turn, Shift strokes harder. ~1.4 m/s at a steady
  pace (~2 m/s hard), gliding and slowing on the hull's drag, the keel holding it straight, drifting with the sim's wind, running
  aground where the water is shallower than it draws (kept within the lakes' drawn outlines). `-hbpaddle=N` paddles it N seconds
  for a test (speed and heading logged, a picture from the seat).
- **The camps** — `AHotBrookCamps`: the dataset's 67 camps, houses, trailers, sheds and a garage and their 54 docks (src/w3/true/
  camps3d.js, laid out as the browser's view does — `ue/export/export_camps.mjs` → `Import/camps.json`), each built true size by
  `ue/export/build_camps.py` (block or fieldstone foundation, lap / board / log / trailer siding with corner boards, a gable roof of
  painted steel or shingles with its overhangs, fascia and ridge cap, windows with frames, sills, muntins and some shutters — bigger
  to the water, a slider onto the deck — the door with a landing and steps, porch roofs, decks with railings and stairs, brick or
  stone chimneys and stove pipes; docks of boards on posts or aluminium on legs, an L or a T at some), imported with their
  materials by `Scripts/import_camps.py` (Nanite; their triangles their collision — the walker climbs steps, walks decks and docks).
  A building's floor stands over its highest corner (≤ 2.6 m over its lowest); a dock ~0.35 m over the lake, in from May 25 to
  October 15 (`hb.DocksIn 1` / `0` forces them). The ROADS (75 km: camp roads with their wheel tracks and grassy crown, the town's
  gravel, Route 169 paved) are strips draped on the ground. The forest's export already clears trees off the lots, roads, paths
  and beaches; `Import/cleared.bin` (export_camps.mjs) keeps the ground cover off them too. The BOATS at the docks while they are in (44, as the
  browser's layout has them): 14-ft aluminium skiffs (plain or painted green) and the pontoon boat tied alongside, riding the water
  with a slow bob; canoes turned over and kayaks on the docks or the banks — the hulls lofted by build_camps.py, the canoe the
  Sketchfab one.
- **The start** — `Import/start.json` `{"x", "y", "yaw"}` (sim metres, UE degrees; outside the repo) or `-hbstart=X,Y,Yaw`: where
  the walker starts (the nearest dry ground to it); the level's own start without either.
- **Under the water** — `M_HB_Underwater` (`Scripts/make_underwater_material.py`), a post-process `AHotBrookWaterSurface` turns on
  while the camera is under the surface: the light reaching each thing dimmed by the water above it (per colour, the browser's Kd:
  tea water loses blue first), what the eye sees of it dimmed along the path (M_LakeWater's absorption + scattering), and the
  water's own light filling in — bright toward the surface, dark below — in the scene's exposure. Visibility a few metres, as in
  the lakes.
- **Coordinates** — the sim's metres (x east, y north, heights above sea level) to Unreal's cm: X east, Y south, Z up, heights
  less 110 m (`HotBrookCoords.h`).
- **Checking the view** — run the game with `-hbshot="X,Y,Yaw,Pitch,Name;…"` (sim metres, degrees) and `-hbwait=<s>`: it stands at
  each spot and saves `Saved/Screenshots/<Name>.png`, then quits.

Engine: **UE 5.8** (`G:\Program Files\EpicGames\UE_5.8`; Megaplants need 5.8's Procedural Vegetation Editor, Dynamic Wind and
Nanite Foliage — `ue/retarget.ps1` moved the project), built with Visual Studio 2026's MSVC 14.51.
Build: `Engine\Build\BatchFiles\Build.bat HotBrookEditor Win64 Development -Project=G:\HotBrookUE\HotBrook.uproject -MaxParallelActions=3`
(more parallel compiles ran the page file out of memory).

## The Fab content (in the human's library; never committed)
- Added to the project from the Epic launcher (Fab → My Library → the pack's **+** → Add to Project → HotBrook): the Megaplants
  packs (5.8 only) into `Content/Megaplant_Library`, the Animal Variety Pack (its 5.5 version), a few rock and shrub packs.
  If an add doesn't land, the launcher's copy is in `VaultCache\<pack>\data\Content`. The launcher's cache lives on G:
  (`G:\EpicVaultCache`; `C:\ProgramData\Epic\EpicGamesLauncher\VaultCache` is a junction to it — it had filled 32 GB of C:).
- Megascans surfaces download as JPEGs to `VaultCache\FabLibrary\<listing>\texture-set\`: `python -I ue/export/megascans_surfaces.py`
  makes 2048² copies in `Import/surfaces`, and `make_ground_material.py` imports them.
- The first load of new plant packs builds their Nanite data for a long while (tens of minutes); it is cached after.

## The models' credits (Creative Commons; the files themselves are never committed)
| In the world as | Model | By | Licence |
|---|---|---|---|
| smallmouth bass | [Smallmouth bass](https://sketchfab.com/models/015389aed3414793b3e9e4a0c25169d1) | faerbogdan99 | CC BY 4.0 |
| chain pickerel | [Chain pickerel](https://sketchfab.com/models/dbffc5fa6b6f44d99692cb7c7719de4e) | faerbogdan99 | CC BY 4.0 |
| brown bullhead | [Channel catfish](https://sketchfab.com/models/038752a9cd3445feb074a569671c27f1) | faerbogdan99 | CC BY 4.0 |
| blacknose dace, fallfish, alewife | [Common dace](https://sketchfab.com/models/cdc4f59efaa04fe391a5cff9b89c4ca3) | faerbogdan99 | CC BY 4.0 |
| great blue heron | [Great blue heron](https://sketchfab.com/models/52cffc22bf2441468739ac3ba6d599aa) | faerbogdan99 | CC BY 4.0 |
| yellow perch | [European perch](https://sketchfab.com/models/fecae0f415b2400aadf298374797f8fc) | animalica | CC BY 4.0 |
| white sucker | [Hog Sucker](https://sketchfab.com/models/1d67736a2fdd4151ac57d5082dd50514) | Grand Rapids Public Museum | CC BY 4.0 |
| banded killifish | [Northern Studfish](https://sketchfab.com/models/536261fbba2b49de8e31fe0c625cf55b) | MTSUichthyology | CC BY 4.0 |
| white perch | [Yellow Bass](https://sketchfab.com/models/908d991cc9da4441be7e9293be18a1f9) | MTSUichthyology | CC BY 4.0 |
| pumpkinseed, redbreast | [Model 38 – Pumpkinseed Sunfish](https://sketchfab.com/models/e8cbd8d90e47463b831ceed70bc146cb) | DigitalLife3D | CC BY-NC 4.0 |
| common loon | [Common Loon](https://sketchfab.com/models/24374cff63c345cba6fff9e80feb2c17) | Innovation Studio | CC BY 4.0 |
| bald eagle | [Bald Eagle Flying Bird Model](https://sketchfab.com/models/30434fd1272f464a8540750a78a5087f) | Pigcraft | CC BY 4.0 |
| canoe | [Cruising Canoe](https://sketchfab.com/models/982bd54e6278492484d3154d09dbe59d) | gogiart | CC BY 4.0 |

The camps' textures (`Import/textures`, CC0 — no attribution required, listed with thanks): from [Poly Haven](https://polyhaven.com) —
brown_planks_05 (lap siding), old_planks_02 (board siding), wood_trunk_wall (logs), box_profile_metal_sheet (steel roofs, its colour
made neutral), plank_flooring_03 (decks and docks), concrete_block_wall, red_brick, rock_wall_15 (fieldstone), rocky_trail (the
roads); from [ambientCG](https://ambientcg.com) — RoofingTiles003 (shingle roofs), PaintedWood009C (trim, doors), Metal050C
(aluminium).

The bear and the moose the human downloaded are not listed: they are for the human's own use only and are never committed,
published or shared.

## Running it (at the PC — Remote Desktop caps everything at ~30 fps)
1. The live simulation: from the repo folder, `node ue/link/simhost.mjs` (ws://127.0.0.1:8771). It starts the lakes in ~15 s and
   keeps them running at real time; leave it open.
2. The world: double-click `G:\HotBrookUE\HotBrook.uproject` (opens the editor; press Play), or straight into the game:
   `"G:\Program Files\EpicGames\UE_5.8\Engine\Binaries\Win64\UnrealEditor.exe" G:\HotBrookUE\HotBrook.uproject -game -windowed -ResX=1920 -ResY=1080`
3. Walk: mouse to look, W A S D, Shift to run, Space to jump (and to come up when diving), C / Ctrl to dive; Esc / Alt-F4 to quit.

## Rebuilding after a change
- C++: `"G:\Program Files\EpicGames\UE_5.8\Engine\Build\BatchFiles\Build.bat" HotBrookEditor Win64 Development -Project=G:\HotBrookUE\HotBrook.uproject -MaxParallelActions=3`
- the world data: `HB_WORLD=true node ue/export/export_world.mjs`, `python -I ue/export/canopy_raw.py src/w3/true/canopy3.jpg G:/HotBrookUE/Import/canopy.bin`,
  `python -I ue/export/canopy_texture.py G:/HotBrookUE/Import/canopy.bin G:/HotBrookUE/Import/canopy_rgba.png`,
  `HB_WORLD=true node ue/export/export_forest.mjs`, `python -I ue/export/megascans_surfaces.py`
- the scans: `import_megascans.py` (Nanite meshes and their materials from the launcher's downloads; HB_REIMPORT=1 to redo),
  `check_megascans.py` (what each wears); `fix_megaplants.py` mends packs whose materials point outside them (Baltic Pine's bark)
- the materials and the tree mapping (`UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/<name>.py`):
  `make_ground_material.py`, `make_water_material.py`, `make_forest_meshes.py` (`inspect_megaplants.py` lists the plant meshes)
- the camps: `HB_WORLD=true node ue/export/export_camps.mjs`, `python -I ue/export/build_camps.py` (needs numpy; Pillow to measure the
  textures), then `import_camps.py` (the textures in `Import/textures` with their `manifest.json`)
- the level: `UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=HotBrookBuild`
- all of it on another engine version: `powershell -File ue\retarget.ps1 -Version 5.8`
