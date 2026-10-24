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
- **The live link** — `node ue/link/simhost.mjs` runs the sim at real time and streams it to `AHotBrookLink`
  (ws://127.0.0.1:8771): the clock (the sun placed for the date and hour), the weather and wind, the fish near the walker
  (stand-in cones for now), the forest's large animals.
- **The walker** — `HotBrookCharacter`: first person at 1.65 m; W A S D / arrows, mouse, Shift to run, Space to jump; wading,
  swimming past chest depth, diving with C / Ctrl; on the ice in winter.
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
- the materials and the tree mapping (`UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/<name>.py`):
  `make_ground_material.py`, `make_water_material.py`, `make_forest_meshes.py` (`inspect_megaplants.py` lists the plant meshes)
- the level: `UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=HotBrookBuild`
- all of it on another engine version: `powershell -File ue\retarget.ps1 -Version 5.8`
