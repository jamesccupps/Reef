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
- **The models** — downloaded from Sketchfab to `G:\HotBrookUE\Import\sketchfab` (never committed); `ue/export/convert_models.py`
  (Blender 5.1) lays each on its axes (a fish's length on +X, back up), cuts it to ~12,000 triangles (birds 24,000, the canoe
  30,000), sizes it (a fish 1 m long; a bird, a boat to its real size) and writes `Import/models/<name>.glb` with three views to
  check it by; `Scripts/import_models.py` brings them in (`/Game/HotBrook/Models`) and makes `M_HB_Fish`. The loon's Collada
  file went through trimesh + pycollada to a .glb first (Blender 5 reads no Collada).
- **The walker** — `HotBrookCharacter`: first person at 1.65 m; W A S D / arrows, mouse, Shift to run, Space to jump; wading,
  swimming past chest depth (the head riding the water: a slow swell and a breaststroke's rhythm), diving with C / Ctrl; on the ice
  in winter.
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
- the level: `UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=HotBrookBuild`
- all of it on another engine version: `powershell -File ue\retarget.ps1 -Version 5.8`
